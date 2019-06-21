import powerbi from "powerbi-visuals-api";
import { WordCloudSettings } from "./settings";
import ISelectionId = powerbi.visuals.ISelectionId;
import { Point } from "powerbi-visuals-utils-svgutils";
export interface WordCloudText {
    text: string;
    textGroup: string;
    count: number;
    index: number;
    selectionId: ISelectionId;
    color: string;
}
export interface WordCloudGroup {
    text: string;
    count: number;
    wordIndex: number;
    selectionIds: ISelectionId[];
    color: string;
}
export interface WordCloudDataPoint extends Point {
    text: string;
    xOff: number;
    yOff: number;
    rotate?: number;
    size?: number;
    padding: number;
    width: number;
    height: number;
    sprite?: number[];
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    color: string;
    selectionIds: ISelectionId[];
    wordIndex: number;
    getWidthOfWord?: () => number;
    count: number;
    widthOfWord?: number;
    isHighlighted: boolean;
    highlighted: boolean;
}
import DataView = powerbi.DataView;
export interface WordCloudData {
    dataView: DataView;
    settings: WordCloudSettings;
    texts: WordCloudText[];
    dataPoints: WordCloudDataPoint[];
}
export interface WordCloudDataView {
    data: WordCloudDataPoint[];
}
