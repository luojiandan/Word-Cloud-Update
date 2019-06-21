import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
export declare class WordCloudSettings extends DataViewObjectsParser {
    general: GeneralSettings;
    dataPoint: DataPointSettings;
    stopWords: StopWordsSettings;
    rotateText: RotateTextSettings;
    performance: PerformanceSettings;
}
export declare class GeneralSettings {
    static FontSizePercentageFactor: number;
    static MinFontSize: number;
    TransparencyOfHighlight: number;
    minRepetitionsToDisplay: number;
    maxNumberOfWords: number;
    minFontSize: number;
    maxFontSize: number;
    isBrokenText: boolean;
    isPunctuationsCharacters: boolean;
}
export declare class DataPointSettings {
    defaultColor: string;
}
export declare class StopWordsSettings {
    show: boolean;
    isDefaultStopWords: boolean;
    words: string;
}
export declare class RotateTextSettings {
    static MinAngle: number;
    static MaxAngle: number;
    static MinNumberOfWords: number;
    static MaxNumberOfWords: number;
    show: boolean;
    minAngle: number;
    maxAngle: number;
    maxNumberOfOrientations: number;
}
export declare class PerformanceSettings {
    preestimate: boolean;
    quality: number;
}
