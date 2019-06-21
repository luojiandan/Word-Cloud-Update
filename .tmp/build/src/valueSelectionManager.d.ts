import powerbi from "powerbi-visuals-api";
import { WordCloudDataPoint } from "./dataInterfaces";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionId = powerbi.visuals.ISelectionId;
export interface SelectionIdValues<T> {
    value: T;
    selectionId: ISelectionId[];
}
export declare class ValueSelectionManager<T> {
    private ddd;
    private selectedValuesValue;
    private visualHost;
    private getSelectionIds;
    private selectionManager;
    constructor(visualHost: IVisualHost, getSelectionIds: (value: T) => ISelectionId[], getDataPoints: () => WordCloudDataPoint[], renderSelection: () => void);
    readonly selectedValues: T[];
    readonly selectionIds: ISelectionId[];
    readonly hasSelection: boolean;
    readonly getSelectionIdValues: SelectionIdValues<T>[];
    selectAndSendSelection(value: T[] | T, multiSelect?: boolean): void;
    isSelected(selectionId: T[] | T): boolean;
    sendSelection(): void;
    clear(sendToHost: boolean): void;
    private selectInternal;
    private sendSelectionToHost;
}
