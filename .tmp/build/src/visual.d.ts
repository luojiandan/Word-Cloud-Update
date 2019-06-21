import "@babel/polyfill";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import DataView = powerbi.DataView;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import IVisual = powerbi.extensibility.IVisual;
import IColorPalette = powerbi.extensibility.IColorPalette;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import { WordCloudData } from "./dataInterfaces";
export declare class WordCloud implements IVisual {
    private static ClassName;
    private tooltipService;
    private static Words;
    private static WordGroup;
    private static StopWordsDelimiter;
    private static Radians;
    private static MinOpacity;
    private static MaxOpacity;
    static PreparedRandoms: number[];
    private static Punctuation;
    private static StopWords;
    private static DefaultMargin;
    private static MinViewport;
    private static DataPointFillProperty;
    /**
     * Names of these consts aren't good, but I have no idea how to call them better.
     * TODO: Please rename them if you know any better names.
     */
    private static TheFirstLineHeight;
    private static TheSecondLineHeight;
    private static TheThirdLineHeight;
    private static TheFourthLineHeight;
    private static DefaultTextFontSize;
    private static MinFakeSize;
    private static DefaultStrokeStyle;
    private static DefaultTextAlign;
    private static ArchimedeanFactor;
    private static WidthOffset;
    private static PositionOffset;
    private static IndexOffset;
    private static LxOffset;
    private static ScalePositionOffset;
    private static ByteMask;
    private static TheFirstByteMask;
    private static SxMask;
    private static LineWidthFactor;
    private static AdditionalDataPointSize;
    private static AdditionalTextWidth;
    private static AdditionalRandomValue;
    private static MinCount;
    private static DefaultDT;
    private static DefaultX;
    private static DefaultY;
    private static DefaultPadding;
    private static DefaultWidth;
    private static DefaultHeight;
    private static DefaultXOff;
    private static DefaultYOff;
    private static DefaultX0;
    private static DefaultY0;
    private static DefaultX1;
    private static DefaultY1;
    private static XOffsetPosition;
    private static YOffsetPosition;
    private static HeightOffsetPosition;
    private static TextFillColor;
    private static MinFontSize;
    private static DefaultAngle;
    private static ContextStartPosition;
    private static DefaultMaxHeightOfTheWord;
    private static FontSizePercentage;
    private readonly settings;
    private data;
    private colorPalette;
    private durationAnimations;
    private specialViewport;
    private fakeViewport;
    private canvasViewport;
    private root;
    private main;
    private wordsContainerSelection;
    private wordsGroupUpdateSelection;
    private wordsTextUpdateSelection;
    canvasContext: CanvasRenderingContext2D;
    private fontFamily;
    private layout;
    private visualHost;
    private selectionManager;
    private visualUpdateOptions;
    private isUpdating;
    private incomingUpdateOptions;
    private oldIdentityKeys;
    private static punctuationRegExp;
    private static whiteSpaceRegExp;
    static converter(dataView: DataView, colorPalette: IColorPalette, visualHost: IVisualHost): WordCloudData;
    constructor(options: VisualConstructorOptions);
    init(options: VisualConstructorOptions): void;
    update(visualUpdateOptions: VisualUpdateOptions): void;
    private static parseSettings;
    private clear;
    private estimatePossibleWordsToDraw;
    private computePositions;
    private computeCycle;
    private getRatio;
    private updateBorders;
    private generateSprites;
    private setSprites;
    private findPosition;
    private archimedeanSpiral;
    private checkIntersect;
    private checkIntersectOfRectangles;
    /**
     * Returns a CanvasRenderingContext2D to compute size of the text.
     *
     * Public for testability.
     */
    getCanvasContext(canvasElement: HTMLCanvasElement): CanvasRenderingContext2D;
    private updateSize;
    private render;
    private clearIncorrectSelection;
    private setSelection;
    private clearSelection;
    private scaleMainView;
    private renderSelection;
    private setOpacity;
    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject;
    private enumerateDataPoint;
    private enumerateDataPointColor;
    private addAnInstanceToEnumeration;
    private animateSelection;
    private renderTooltip;
    destroy(): void;
    private static getReducedText;
    private static CleanAndSplit;
    private static getStopWords;
    private static getExcludes;
    private static processText;
    private static getBrokenWords;
    private static getFilteredSentences;
    private static getFilteredWords;
    private static getDataPoints;
    private static getWordFontSize;
    private static getWeightByScaleType;
    /**
     * Uses to iterate by custom array cyclically.
     * The starting index can be changed with offset.
     */
    static getFromCycledSequence(targetArray: number[], index: number, offset?: number): number;
    private static getAngle;
}
