import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import PrimitiveValue = powerbi.PrimitiveValue;
export declare class WordCloudColumns<T> {
    static getCategoricalValues(dataView: DataView): WordCloudColumns<DataViewCategoryColumn[]>;
    static getSeriesValues(dataView: DataView): PrimitiveValue[];
    static getCategoricalColumns(dataView: DataView): WordCloudColumns<DataViewCategoryColumn>;
    Category: T;
    Values: T;
    Excludes: T;
}
