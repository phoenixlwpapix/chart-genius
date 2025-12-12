import { GoogleGenAI, Type } from "@google/genai";
import { ChartType, ChartData, SeriesConfig, Language } from '../types';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
      console.warn("API Key is missing!");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeText(text: string): Promise<ChartData> {
    try {
      // Define the schema for structured output
      const schema = {
        type: Type.OBJECT,
        properties: {
          suggestedChartType: {
            type: Type.STRING,
            enum: [ChartType.BAR, ChartType.LINE, ChartType.PIE, ChartType.AREA, ChartType.SCATTER, ChartType.COMBO],
            description: "The most suitable chart type. Use 'combo' if there are mixed data types like quantities (bars) and rates/percentages (lines).",
          },
          title: {
            type: Type.STRING,
            description: "A concise and descriptive title for the chart.",
          },
          description: {
            type: Type.STRING,
            description: "A short description of what the data represents.",
          },
          xAxisLabel: {
            type: Type.STRING,
            description: "Label for the X-axis (category).",
          },
          yAxisLabel: {
            type: Type.STRING,
            description: "Label for the Y-axis (values).",
          },
          seriesKeys: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "The keys used for the numerical values in the data objects (e.g., ['sales', 'profit']).",
          },
          seriesConfigs: {
             type: Type.ARRAY,
             items: {
                type: Type.OBJECT,
                properties: {
                   key: { type: Type.STRING },
                   type: { type: Type.STRING, enum: ['bar', 'line'] },
                   axis: { type: Type.STRING, enum: ['left', 'right'] }
                }
             },
             description: "Configuration for each series in a combo chart. Map quantities to 'bar' on 'left' axis, and rates/percentages to 'line' on 'right' axis."
          },
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "The category name or x-axis value." },
                value: { type: Type.NUMBER, description: "Primary value (optional if using custom keys)." },
                val1: { type: Type.NUMBER, description: "Value for first series" },
                val2: { type: Type.NUMBER, description: "Value for second series (optional)" },
                val3: { type: Type.NUMBER, description: "Value for third series (optional)" },
                val4: { type: Type.NUMBER, description: "Value for fourth series (optional)" },
              },
              required: ["name"]
            },
            description: "The data points extracted from the text.",
          },
        },
        required: ["suggestedChartType", "title", "data", "seriesKeys"],
      };

      const prompt = `
        Analyze the following text and extract structured data suitable for visualization.
        Determine the best chart type. 
        
        CRITICAL INSTRUCTION FOR COMBO CHARTS:
        If the data contains BOTH absolute quantities (like "Processing Volume", "Sales", "Count") AND rates/percentages (like "Growth Rate", "YoY", "%"), you MUST suggest 'combo' as the chart type.
        For 'combo' charts:
        - Map the quantity series to type 'bar' and axis 'left'.
        - Map the rate/percentage series to type 'line' and axis 'right'.
        
        Extract the data points. 
        If there is only one data series, use 'val1' for the value and set seriesKeys to ["value"].
        If there are multiple series (e.g., Revenue and Cost), use 'val1', 'val2', etc., and map them in 'seriesKeys' (e.g., ["Revenue", "Cost"]).
        
        Text to analyze:
        "${text}"
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          systemInstruction: "You are a data extraction expert. Your goal is to convert unstructured text into clean, valid JSON for charting libraries.",
        },
      });

      const resultText = response.text;
      if (!resultText) throw new Error("No response from Gemini");

      const parsed = JSON.parse(resultText);

      // Post-process data to match our flexible DataPoint interface
      const processedData = parsed.data.map((item: any) => {
        const newItem: any = { name: item.name };
        // Map val1, val2 to the actual series keys found in parsed.seriesKeys
        parsed.seriesKeys.forEach((key: string, index: number) => {
          const valKey = `val${index + 1}`;
          if (item[valKey] !== undefined) {
            newItem[key] = item[valKey];
          } else if (index === 0 && item.value !== undefined) {
             newItem[key] = item.value;
          }
        });
        return newItem;
      });

      return {
        title: parsed.title,
        description: parsed.description,
        xAxisLabel: parsed.xAxisLabel,
        yAxisLabel: parsed.yAxisLabel,
        suggestedType: parsed.suggestedChartType as ChartType,
        seriesKeys: parsed.seriesKeys,
        seriesConfigs: parsed.seriesConfigs as SeriesConfig[] || [],
        data: processedData
      };

    } catch (error) {
      console.error("Gemini Analysis Failed:", error);
      throw error;
    }
  }

  async translateChartData(data: ChartData, targetLang: Language): Promise<ChartData> {
    try {
        const prompt = `
            Translate the text content of the following JSON chart data to ${targetLang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Fields to translate:
            - title
            - description
            - xAxisLabel
            - yAxisLabel
            - seriesKeys (translate these keys, I will map them back)
            - data[].name (the category names)
            
            Do NOT translate the numeric values or change the structure.
            Return the exact same JSON structure with translated strings.
            
            JSON Data:
            ${JSON.stringify(data)}
        `;

        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                // We use loose schema or just expect the same structure. 
                // Since we are transforming existing data, plain JSON mode is usually robust enough with 2.5-flash.
            },
        });

        const resultText = response.text;
        if(!resultText) throw new Error("Translation failed");
        
        return JSON.parse(resultText) as ChartData;

    } catch (error) {
        console.error("Translation Failed:", error);
        return data; // Return original data on failure
    }
  }
}