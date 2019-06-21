/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";
import "@babel/polyfill";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import * as d3 from "d3";
import { 
    WordCloudSettings,
    GeneralSettings,
    DataPointSettings,
    StopWordsSettings,
    RotateTextSettings,
    PerformanceSettings
} from "./settings";
import {
    wordCloudUtils
} from "./utils";

// d3
import Selection = d3.Selection;
import UpdateSelection = d3.selection.Update;
import Transition = d3.Transition;

// powerbi
import IViewport = powerbi.IViewport;
import DataView = powerbi.DataView;
import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import VisualObjectInstanceEnumeration=powerbi.VisualObjectInstanceEnumeration;
import PrimitiveValue = powerbi.PrimitiveValue;
import DataViewScopeIdentity=powerbi.DataRepetitionKind.ScopeIdentity;

// powerbi.extensibility
import IVisual = powerbi.extensibility.IVisual;
import IColorPalette = powerbi.extensibility.IColorPalette;

// powerbi.extensibility.visual
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionIdBuilder = powerbi.extensibility.ISelectionIdBuilder;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

// powerbi.visuals
import ISelectionId = powerbi.visuals.ISelectionId;

// powerbi.extensibility.utils.svg

//import IMargin = powerbi.extensibility.utils.svg.IMargin;
//import IPoint = powerbi.extensibility.utils.svg.shapes.IPoint;
import {
    CssConstants, manipulation, shapesInterfaces, IMargin, IRect, Rect, shapes, Point
}
    from "powerbi-visuals-utils-svgutils";
import translate =manipulation.translate;
import translateAndScale = manipulation.translateAndScale;
import createClassAndSelector = CssConstants.createClassAndSelector;
import ClassAndSelector = CssConstants.ClassAndSelector;

// powerbi.extensibility.utils.type
//import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
import {
    double as Double,
    prototype as Prototype,
    valueType,
    pixelConverter as PixelConverter
} from "powerbi-visuals-utils-typeutils";

// powerbi.extensibility.utils.formatting
//import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
//import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
//import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
import {
    valueFormatter,
    textMeasurementService
} from "powerbi-visuals-utils-formattingutils";
import ValueFormatter =valueFormatter.valueFormatter; //.  powerbi.extensibility.utils.formatting.valueFormatter;
import IValueFormatter = valueFormatter.IValueFormatter;


// powerbi.extensibility.utils.color
//import ColorHelper = powerbi.extensibility.utils.color.ColorHelper;
import {
    ColorHelper
} from "powerbi-visuals-utils-colorutils";

// powerbi.extensibility.utils.tooptip
// import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
// import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
// import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;
import {
    TooltipEventArgs,
    ITooltipServiceWrapper,
    createTooltipServiceWrapper
} from "powerbi-visuals-utils-tooltiputils";

import {
    WordCloudText,
    WordCloudGroup,
    WordCloudDataPoint,
    WordCloudData,
    WordCloudDataView
} from "./dataInterfaces";
import {
    VisualLayout
} from "./layout";
import{
    WordCloudColumns
} from "./columns";
import{
    ValueSelectionManager,
    SelectionIdValues
} from "./valueSelectionManager";
//import CanvasTextAlign
import * as _ from "lodash";
import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";

type WordMap = { [word: string]: boolean };

enum WordCloudScaleType {
    logn,
    sqrt,
    value
}

export class WordCloud implements IVisual {
    //private settings: WordCloudSettings;
    private static ClassName: string = "wordCloud";
    private tooltipService: ITooltipServiceWrapper;
    private static Words: ClassAndSelector = createClassAndSelector("words");
    private static WordGroup: ClassAndSelector = createClassAndSelector("word");
    private static StopWordsDelimiter: string = " ";
    private static Radians: number = Math.PI / 180;
    private static MinOpacity: number = 0.2;
    private static MaxOpacity: number = 1;

    public static PreparedRandoms: number[] = [
        0.7119651380581562,
        0.9329344002304909,
        0.662959468447071,
        0.9228123970858741,
        0.43461353653769996,
        0.9717759976768092,
        0.23354868432789977,
        0.05665724247093462,
        0.9133485665730616,
        0.42817521183988005,
        0.3431085737847315,
        0.6324131131505653,
        0.7468332461483578,
        0.4643976574428279,
        0.4750947480854484,
        0.2143275692982769,
        0.39899915692847454,
        0.9081383316416052,
        0.4884639438943552,
        0.6512544550008093,
        0.7020535189664152,
        0.5855367801489577,
        0.4163850692496507,
        0.38506558455341144,
        0.7726508508690297,
        0.45220013068612275,
        0.9987730018309247,
        0.9966030725467623,
        0.5100716402564676,
        0.8843030102084446,
        0.6185888295842394,
        0.2585174804781327,
        0.9669109683758605,
        0.4792229039278242,
        0.6771520680568055,
        0.06436759010290904,
        0.06577871027668003,
        0.07476647887643595,
        0.3097861449310102,
        0.6697645410312734,
        0.45933560073048785,
        0.6140456351949446,
        0.41313740505582053,
        0.4223996807520398,
        0.273216627761788,
        0.594455364989926,
        0.6111206428844973,
        0.2344564184258855,
        0.7935004554669307,
        0.15634614118589307,
        0.35404688574625043,
        0.9559018017624286,
        0.20373931295767522,
        0.589806042363701,
        0.48676220830768857,
        0.2630657508957841,
        0.9840415707128016,
        0.6683721512493264,
        0.6800096146801025,
        0.3771308535548552,
        0.280209191150526,
        0.8174784609535564,
        0.22975018037139705,
        0.7014031004777657,
        0.9838404957723734,
        0.3980602404401452,
        0.15250625386122674,
        0.40714150687677053,
        0.5712314130109579,
        0.24557673419176118,
        0.5767449586868045,
        0.420320306742207,
        0.7028689593560018,
        0.9326180451104844,
        0.6166855894615995,
        0.2367178370531675,
        0.2493272366865278,
        0.4644410266668575,
        0.7896221140300397,
        0.680882424354031,
        0.0029629084067046563,
        0.0979613143571465,
        0.3202875814486119,
        0.7925423139206076,
        0.8654113018607466,
        0.9571407616513157,
        0.14242246772434441,
        0.05020948959091154,
        0.037391824571629595,
        0.3620785408785594,
        0.17788577243572745,
        0.03870854119017397,
        0.45348901969702826,
        0.14773330398707096,
        0.4829866527254727,
        0.6917393749231506,
        0.1948561915730751,
        0.5602782437544376,
        0.5485548947416654,
        0.8662688115119965,
        0.07982360080189133,
        0.8798860513813294,
        0.7735626915256364,
        0.7887931317844401,
        0.8786305221478938,
        0.9782356557805927,
        0.8698593252656257,
        0.9798429306765815,
        0.9125054440052776,
        0.7071114232379871,
        0.7343649239762027,
        0.36464367209680404,
        0.6539512470571758,
        0.5433197785789505,
        0.2132301795467224,
        0.6090221657181336,
        0.9445309978523204,
        0.8394516248024986,
        0.10021084646589773,
        0.774218487658193,
        0.4696885674127247,
        0.30658052221710186,
        0.6894459120200798,
        0.5522419897341373,
        0.7526198658064869,
        0.03148319408882316,
        0.5619938316490898,
        0.8973245539219599,
        0.5547965192937578,
        0.9691891251891405,
        0.8895331945745231,
        0.15054507376971227,
        0.8674501624139273,
        0.025667523239569556,
        0.17484001304286023,
        0.5545436578380758,
        0.25914191780371554,
        0.7538003379951115,
        0.7955673652292796,
        0.6844265178341766,
        0.9566325432078542,
        0.5899073183082202,
        0.2699370030222161,
        0.4080942990841423,
        0.7877546776964146,
        0.29399227188680577,
        0.26716994700559527,
        0.27688430337482495,
        0.5336060372482627,
        0.5670500974881956,
        0.7308249505322317
    ];
    private static Punctuation: string[] = [
        "!", ".", ":", "'", ";", ",", "?",
        "@", "#", "$", "%", "^", "&", "*",
        "(", ")", "[", "]", "\"", "\\", "/",
        "-", "_", "+", "=", "<", ">", "|"
    ];

    private static StopWords: string[] = [
        "a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an",
        "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot",
        "could", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get",
        "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i",
        "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may",
        "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often",
        "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should",
        "since", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these",
        "they", "this", "tis", "to", "too", "twas", "us", "wants", "was", "we", "were", "what",
        "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "yet",
        "you", "your"
    ];

    private static DefaultMargin: IMargin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    };

    private static MinViewport: IViewport = {
        width: 0,
        height: 0
    };

    private static DataPointFillProperty: DataViewObjectPropertyIdentifier = {
        objectName: "dataPoint",
        propertyName: "fill"
    };

    /**
     * Names of these consts aren't good, but I have no idea how to call them better.
     * TODO: Please rename them if you know any better names.
     */
    private static TheFirstLineHeight: string = PixelConverter.toString(5); // Note: This construction fixes bug #6343.
    private static TheSecondLineHeight: string = PixelConverter.toString(10); // Note: This construction fixes bug #6343.
    private static TheThirdLineHeight: string = PixelConverter.toString(14); // Note: This construction fixes bug #6343.
    private static TheFourthLineHeight: string = PixelConverter.toString(15); // Note: This construction fixes bug #6343.

    private static DefaultTextFontSize: string = PixelConverter.toString(1);
    private static MinFakeSize: number = 1;
    private static DefaultStrokeStyle: string = "red";
    private static DefaultTextAlign: string = "center";
    private static ArchimedeanFactor: number = 0.1;

    private static WidthOffset: number = 5;
    private static PositionOffset: number = 1;
    private static IndexOffset: number = 2;
    private static LxOffset: number = 4;

    private static ScalePositionOffset: number = 5;

    private static ByteMask: number = 31;
    private static TheFirstByteMask: number = 32;
    private static SxMask: number = 127;

    private static LineWidthFactor: number = 2;

    private static AdditionalDataPointSize: number = 1;
    private static AdditionalTextWidth: number = 2;
    private static AdditionalRandomValue: number = 0.5;

    private static MinCount: number = 1;

    private static DefaultDT: number = 1;
    private static DefaultX: number = 0;
    private static DefaultY: number = 0;
    private static DefaultPadding: number = 1;
    private static DefaultWidth: number = 0;
    private static DefaultHeight: number = 0;
    private static DefaultXOff: number = 0;
    private static DefaultYOff: number = 0;
    private static DefaultX0: number = 0;
    private static DefaultY0: number = 0;
    private static DefaultX1: number = 0;
    private static DefaultY1: number = 0;

    private static XOffsetPosition: number = 0.5;
    private static YOffsetPosition: number = 0.75;
    private static HeightOffsetPosition: number = 0.85;
    private static TextFillColor: string = "rgba(63, 191, 191, 0.0)";

    private static MinFontSize: number = 0;
    private static DefaultAngle: number = 0;

    private static ContextStartPosition: number = 0;

    private static DefaultMaxHeightOfTheWord: number = 0;

    private static FontSizePercentage: number = 100;

    private get settings(): WordCloudSettings {
        return this.data && this.data.settings;
    }
    private data: WordCloudData;
    private colorPalette: IColorPalette;
    private durationAnimations: number = 50;

    private specialViewport: IViewport;

    private fakeViewport: IViewport = {
        width: 1500,
        height: 1000
    };

    private canvasViewport: IViewport = {
        width: 128,
        height: 2048
    };

    private root: Selection<any>;
    private main: Selection<any>;
    private wordsContainerSelection: Selection<any>;
    private wordsGroupUpdateSelection: UpdateSelection<WordCloudDataPoint>;
    private wordsTextUpdateSelection: UpdateSelection<WordCloudDataPoint>;
    public canvasContext: CanvasRenderingContext2D;
    private fontFamily: string;
    private layout: VisualLayout;
    private visualHost: IVisualHost;
    private selectionManager: ValueSelectionManager<string>;
    private visualUpdateOptions: VisualUpdateOptions;
    private isUpdating: boolean = false;
    private incomingUpdateOptions: VisualUpdateOptions;
    private oldIdentityKeys: string[];
    private static punctuationRegExp: RegExp = new RegExp(`[${WordCloud.Punctuation.join("\\")}]`, "gim");
    private static whiteSpaceRegExp: RegExp = /\s/;

    public static converter(
        dataView: DataView,
        colorPalette: IColorPalette,
        visualHost: IVisualHost
    ): WordCloudData {
        const categorical: WordCloudColumns<DataViewCategoryColumn> = WordCloudColumns.getCategoricalColumns(dataView);

        if (!categorical || !categorical.Category || _.isEmpty(categorical.Category.values)) {
            return null;
        }

        const colorHelper: ColorHelper = new ColorHelper(
            colorPalette,
            WordCloud.DataPointFillProperty,
            wordCloudUtils.getRandomColor()
        );

        const catValues: WordCloudColumns<any[]> = WordCloudColumns.getCategoricalValues(dataView);
        const settings: WordCloudSettings = WordCloud.parseSettings(dataView, colorHelper);

        const wordValueFormatter: IValueFormatter = ValueFormatter.create({
            format: ValueFormatter.getFormatStringByColumn(categorical.Category.source)
        });

        const excludedSet: PrimitiveValue[] = !categorical.Excludes || _.isEmpty(categorical.Excludes.values)
            ? []
            : categorical.Excludes.values;

        const excludedWords = this.getExcludes(excludedSet, settings);

        const queryName: string = (categorical.Values
            && categorical.Values[0]
            && categorical.Values[0].source
            && categorical.Values[0].source.queryName)
            || null;
        
        const texts: WordCloudText[] = [];

        for (let index: number = 0; index < catValues.Category.length; index += 1) {
            let item: any = catValues.Category[index];

            if (!item) continue;

            let color: string;

            if (categorical.Category.objects && categorical.Category.objects[index]) {
                color = colorHelper.getColorForMeasure(categorical.Category.objects[index], "", "foreground");
            } else {
                color = colorHelper.getHighContrastColor(
                    "foreground",
                    settings.dataPoint.defaultColor || colorPalette.getColor(index.toString()).value
                );
            }

            const selectionIdBuilder: ISelectionIdBuilder = visualHost
                .createSelectionIdBuilder()
                .withCategory(dataView.categorical.categories[0], index);

            if (queryName) {
                selectionIdBuilder.withMeasure(queryName);
            }

            item = wordValueFormatter.format(item);

            texts.push({
                text: item,
                count: (catValues.Values
                    && catValues.Values[index]
                    && !isNaN(catValues.Values[index]))
                    ? catValues.Values[index]
                    : WordCloud.MinCount,
                index: index,
                selectionId: selectionIdBuilder.createSelectionId() as ISelectionId,
                color: color,
                textGroup: item                        
            });
        }

        const reducedTexts: WordCloudGroup[] = WordCloud.getReducedText(texts, excludedWords, settings);
        const dataPoints: WordCloudDataPoint[] = WordCloud.getDataPoints(reducedTexts, settings,dataView);

        return {
            dataView,            
            settings,
            texts,            
            dataPoints,
        };
    }

    constructor(options: VisualConstructorOptions) {
        this.init(options);
    }
    public init(options: VisualConstructorOptions): void {
        this.root = d3.select(options.element).append("svg");
        this.tooltipService = createTooltipServiceWrapper(
            options.host.tooltipService,
            options.element);

        this.colorPalette = options.host.colorPalette;
        this.visualHost = options.host;
        
        this.selectionManager = new ValueSelectionManager<string>(
            this.visualHost,
            (text: string): ISelectionId[] => {
                const dataPoints: WordCloudDataPoint[] = this.data
                    && this.data.dataPoints
                    && this.data.dataPoints.filter((dataPoint: WordCloudDataPoint) => {
                        return dataPoint.text === text;
                    });

                return dataPoints && dataPoints[0] && dataPoints[0].selectionIds
                    ? dataPoints[0].selectionIds
                    : [];
            },
            () => {
                return this.data.dataPoints;
            },
            this.renderSelection.bind(this)
        );

        this.layout = new VisualLayout(null, WordCloud.DefaultMargin);

        this.root.classed(WordCloud.ClassName, true);

        this.root.on("click", () => {
            this.clearSelection();
        });

        this.fontFamily = this.root.style("font-family");

        this.main = this.root.append("g");

        this.wordsContainerSelection = this.main
            .append("g")
            .classed(WordCloud.Words.className, true);

        // init canvas context for calculate label positions
        const canvas = document.createElement("canvas");
        this.canvasContext = this.getCanvasContext(canvas);
    }

    public update(visualUpdateOptions: VisualUpdateOptions) {
        //this.settings = WordCloud.parseSettings(options && options.dataViews && options.dataViews[0]);
        if (!visualUpdateOptions
            || !visualUpdateOptions.viewport
            || !visualUpdateOptions.dataViews
            || !visualUpdateOptions.dataViews[0]
            || !visualUpdateOptions.viewport
            || !(visualUpdateOptions.viewport.height >= WordCloud.MinViewport.height)
            || !(visualUpdateOptions.viewport.width >= WordCloud.MinViewport.width)) {

            return;
        }

        if (visualUpdateOptions !== this.visualUpdateOptions) {
            this.incomingUpdateOptions = visualUpdateOptions;
        }

        if (!this.isUpdating && (this.incomingUpdateOptions !== this.visualUpdateOptions)) {
            this.visualUpdateOptions = this.incomingUpdateOptions;
            this.layout.viewport = this.visualUpdateOptions.viewport;

            const dataView: DataView = visualUpdateOptions.dataViews[0];

            if (this.layout.viewportInIsZero) {
                return;
            }

            this.updateSize();

            const data: WordCloudData = WordCloud.converter(
                dataView,
                this.colorPalette,
                this.visualHost,
            );
            
            if (!data) {
                this.clear();
                return;
            }

            this.data = data;

            this.computePositions((wordCloudDataView: WordCloudDataView) => {
                this.render(wordCloudDataView);
            });
        }
    }

    private static parseSettings(dataView: DataView, colorHelper: ColorHelper): WordCloudSettings {
        //return WordCloudSettings.parse(dataView) as WordCloudSettings;

        const settings: WordCloudSettings = WordCloudSettings.parse<WordCloudSettings>(dataView);

        settings.general.TransparencyOfHighlight=settings.general.TransparencyOfHighlight>1?1:settings.general.TransparencyOfHighlight;

        settings.general.minFontSize = Math.max(
            settings.general.minFontSize,
            GeneralSettings.MinFontSize);

        settings.general.maxFontSize = Math.max(
            settings.general.maxFontSize,
            GeneralSettings.MinFontSize);

        settings.general.maxFontSize = Math.max(
            settings.general.maxFontSize,
            settings.general.minFontSize);

        settings.rotateText.minAngle = Math.max(
            Math.min(settings.rotateText.minAngle, RotateTextSettings.MaxAngle),
            RotateTextSettings.MinAngle);

        settings.rotateText.maxAngle = Math.max(
            Math.min(settings.rotateText.maxAngle, RotateTextSettings.MaxAngle),
            RotateTextSettings.MinAngle);

        settings.rotateText.maxAngle = Math.max(
            settings.rotateText.maxAngle,
            settings.rotateText.minAngle);

        settings.general.maxNumberOfWords = Math.max(
            Math.min(settings.general.maxNumberOfWords, RotateTextSettings.MaxNumberOfWords),
            RotateTextSettings.MinNumberOfWords);

        settings.rotateText.maxNumberOfOrientations = Math.max(
            Math.min(settings.rotateText.maxNumberOfOrientations, RotateTextSettings.MaxNumberOfWords),
            RotateTextSettings.MinNumberOfWords);

        settings.dataPoint.defaultColor = colorHelper.getHighContrastColor(
            "foreground",
            settings.dataPoint.defaultColor,
        );

        return settings;
    }

    private clear(): void {
        this.main
            .select(WordCloud.Words.selectorName)
            .selectAll(WordCloud.WordGroup.selectorName)
            .remove();
    }

    private estimatePossibleWordsToDraw(words: WordCloudDataPoint[], viewport: IViewport, quality: number = 40): number {
        let sortedWords: WordCloudDataPoint[] = _.sortBy(words, "size");
        let square: number = viewport.height * viewport.width;
        let wordCount: number = 0;

        this.generateSprites(this.canvasContext, words, 0);

        sortedWords.some((word: WordCloudDataPoint) => {
            let wordSquare: number = word.height * word.width * (1 - quality / 100);
            square -= wordSquare;
            if (square < 0) {
                return true;
            }
            wordCount++;
            return false;
        });

        return wordCount;
    }

    private computePositions(onPositionsComputed: (WordCloudDataView) => void): void {
        const words: WordCloudDataPoint[] = this.data.dataPoints;

        if (_.isEmpty(words)) {
            this.clear();

            return;
        }

        requestAnimationFrame(() => {
            let surface: number[] = _.range(
                WordCloud.MinViewport.width,
                (this.specialViewport.width >> WordCloud.WidthOffset) * this.specialViewport.height,
                WordCloud.MinViewport.width);

            words.forEach((dataPoint: WordCloudDataPoint) => {
                dataPoint.getWidthOfWord = () =>
                    dataPoint.widthOfWord
                    ||
                    (dataPoint.widthOfWord = textMeasurementService.textMeasurementService.measureSvgTextWidth({
                        fontFamily: this.fontFamily,
                        fontSize: PixelConverter.toString(dataPoint.size + WordCloud.AdditionalDataPointSize),
                        text: dataPoint.text
                    }) + WordCloud.AdditionalTextWidth);
            });

            let wordsToDraw: WordCloudDataPoint[] = words;

            if (this.settings.performance.preestimate) {
                let countOfWordsToDraw: number = this.estimatePossibleWordsToDraw(words, this.specialViewport, this.settings.performance.quality);
                wordsToDraw = words.slice(0, countOfWordsToDraw);
            }

            if (this.canvasContext) {
                this.computeCycle(
                    wordsToDraw,
                    this.canvasContext,
                    surface,
                    null,
                    onPositionsComputed);
            }
        });
    }

    private computeCycle(
        words: WordCloudDataPoint[],
        context: CanvasRenderingContext2D,
        surface: number[],
        borders: Point[],
        onPositionsComputed: (WordCloudDataView) => void,
        wordsForDraw: WordCloudDataPoint[] = [],
        index: number = 0): void {

        let ratio: number = this.getRatio(words.length);
        while (index < words.length && this.root !== undefined) {
            let word: WordCloudDataPoint = words[index];

            word.x = (this.specialViewport.width / ratio
                * (WordCloud.getFromCycledSequence(WordCloud.PreparedRandoms, index) + WordCloud.AdditionalRandomValue)) >> WordCloud.PositionOffset;

            word.y = (this.specialViewport.height / ratio
                * (WordCloud.getFromCycledSequence(WordCloud.PreparedRandoms, index + 1) + WordCloud.AdditionalRandomValue)) >> WordCloud.PositionOffset;

            if (!word.sprite) {
                this.generateSprites(context, words, index);
            }

            if (word.sprite && this.findPosition(surface, word, borders, index)) {
                wordsForDraw.push(word);

                borders = this.updateBorders(word, borders);
                word.x -= this.specialViewport.width >> WordCloud.PositionOffset;
                word.y -= this.specialViewport.height >> WordCloud.PositionOffset;

                if (wordsForDraw.length >= this.settings.general.maxNumberOfWords) {
                    index = words.length - 1;
                }
            }
            index++;
        }

        onPositionsComputed({
            data: wordsForDraw,
            leftBorder: borders && borders[0],
            rightBorder: borders && borders[1]
        });
    }

    private getRatio(length: number): number {
        let ratio: number = 1;

        if (length <= 10) {
            ratio = 5;
        }
        else if (length <= 25) {
            ratio = 3;
        }
        else if (length <= 75) {
            ratio = 1.5;
        }
        else if (length <= 100) {
            ratio = 1.25;
        }

        return ratio;
    }

    private updateBorders(word: WordCloudDataPoint, borders: Point[]): Point[] {
        if (borders && borders.length === 2) {
            let leftBorder: Point = borders[0],
                rightBorder: Point = borders[1];

            if (word.x + word.x0 < leftBorder.x) {
                leftBorder.x = word.x + word.x0;
            }

            if (word.y + word.y0 < leftBorder.y) {
                leftBorder.y = word.y + word.y0;
            }

            if (word.x + word.x1 > rightBorder.x) {
                rightBorder.x = word.x + word.x1;
            }

            if (word.y + word.y1 > rightBorder.y) {
                rightBorder.y = word.y + word.y1;
            }
        } else {
            borders = [
                {
                    x: word.x + word.x0,
                    y: word.y + word.y0
                }, {
                    x: word.x + word.x1,
                    y: word.y + word.y1
                }
            ];
        }

        return borders;
    }

    private generateSprites(
        context: CanvasRenderingContext2D,
        words: WordCloudDataPoint[],
        startIndex: number): void {

        context.clearRect(
            WordCloud.ContextStartPosition,
            WordCloud.ContextStartPosition,
            this.canvasViewport.width << WordCloud.WidthOffset,
            this.canvasViewport.height);

        let x: number = WordCloud.DefaultX,
            y: number = WordCloud.DefaultX,
            maxHeight: number = WordCloud.DefaultMaxHeightOfTheWord;

        for (let i: number = startIndex, length: number = words.length; i < length; i++) {
            let currentWordData: WordCloudDataPoint = words[i],
                widthOfWord: number = currentWordData.getWidthOfWord(),
                heightOfWord: number = currentWordData.size << WordCloud.PositionOffset;

            if (currentWordData.rotate) {
                const sr: number = Math.sin(currentWordData.rotate * WordCloud.Radians),
                    cr: number = Math.cos(currentWordData.rotate * WordCloud.Radians),
                    widthCr: number = widthOfWord * cr,
                    widthSr: number = widthOfWord * sr,
                    heightCr: number = heightOfWord * cr,
                    heightSr: number = heightOfWord * sr;

                widthOfWord = (Math.max(
                    Math.abs(widthCr + heightSr),
                    Math.abs(widthCr - heightSr)) + WordCloud.ByteMask) >> WordCloud.WidthOffset << WordCloud.WidthOffset;

                heightOfWord = Math.floor(Math.max(
                    Math.abs(widthSr + heightCr),
                    Math.abs(widthSr - heightCr)));
            } else {
                widthOfWord = (widthOfWord + WordCloud.ByteMask) >> WordCloud.WidthOffset << WordCloud.WidthOffset;
            }

            if (heightOfWord > maxHeight) {
                maxHeight = heightOfWord;
            }

            if (x + widthOfWord >= (this.canvasViewport.width << WordCloud.WidthOffset)) {
                x = 0;
                y += maxHeight;
                maxHeight = 0;
            }

            context.save();

            context.font = `normal normal ${currentWordData.size + WordCloud.AdditionalDataPointSize}px ${this.fontFamily}`;

            context.translate(
                (x + (widthOfWord >> WordCloud.PositionOffset)),
                (y + (heightOfWord >> WordCloud.PositionOffset)));

            if (currentWordData.rotate) {
                context.rotate(currentWordData.rotate * WordCloud.Radians);
            }

            context.fillText(currentWordData.text, 0, 0);

            if (currentWordData.padding) {
                context.lineWidth = WordCloud.LineWidthFactor * currentWordData.padding;
                context.strokeText(currentWordData.text, 0, 0);
            }

            context.restore();

            currentWordData.width = widthOfWord;
            currentWordData.height = heightOfWord;

            currentWordData.xOff = x;
            currentWordData.yOff = y;

            currentWordData.x1 = widthOfWord >> WordCloud.PositionOffset;
            currentWordData.y1 = heightOfWord >> WordCloud.PositionOffset;

            currentWordData.x0 = -currentWordData.x1;
            currentWordData.y0 = -currentWordData.y1;
            
            x += widthOfWord;
        }

        this.setSprites(context, words);
    }

    private setSprites(context: CanvasRenderingContext2D, words: WordCloudDataPoint[]): void {
        let pixels: Uint8ClampedArray,
            sprites: number[] = [];

        pixels = context.getImageData(
            WordCloud.ContextStartPosition,
            WordCloud.ContextStartPosition,
            this.canvasViewport.width << WordCloud.WidthOffset,
            this.canvasViewport.height).data;

        for (let i: number = words.length - 1; i >= 0; i--) {
            let currentWordData: WordCloudDataPoint = words[i],
                width: number = currentWordData.width,
                width32: number = width >> 5,
                height: number = currentWordData.y1 - currentWordData.y0,
                x: number = 0,
                y: number = 0,
                seen: number = 0,
                seenRow: number = 0;

            if (currentWordData.xOff + width >= (this.canvasViewport.width << WordCloud.WidthOffset)
                || currentWordData.yOff + height >= this.canvasViewport.height) {
                currentWordData.sprite = null;

                continue;
            }

            for (let j: number = 0; j < height * width32; j++) {
                sprites[j] = 0;
            }

            if (currentWordData.xOff !== null) {
                x = currentWordData.xOff;
            } else {
                return;
            }

            y = currentWordData.yOff;

            seen = 0;
            seenRow = -1;

            for (let j: number = 0; j < height; j++) {
                for (let k: number = 0; k < width; k++) {
                    const l: number = width32 * j + (k >> WordCloud.WidthOffset),
                        index: number = ((y + j)
                            * (this.canvasViewport.width << WordCloud.WidthOffset)
                            + (x + k)) << WordCloud.IndexOffset,
                        m: number = pixels[index]
                            ? 1 << (WordCloud.ByteMask - (k % WordCloud.TheFirstByteMask))
                            : 0;

                    sprites[l] |= m;
                    seen |= m;
                }

                if (seen) {
                    seenRow = j;
                } else {
                    currentWordData.y0++;
                    height--;
                    j--;
                    y++;
                }
            }

            currentWordData.y1 = currentWordData.y0 + seenRow;
            currentWordData.sprite = sprites.slice(0, (currentWordData.y1 - currentWordData.y0) * width32);
        }
    }

    private findPosition(surface: number[], word: WordCloudDataPoint, borders: Point[], index: number): boolean {
        let startPoint: Point = { x: word.x, y: word.y },
            delta: number = Math.sqrt(this.specialViewport.width * this.specialViewport.width
                + this.specialViewport.height * this.specialViewport.height),
            point: Point,
            dt: number = WordCloud.getFromCycledSequence(WordCloud.PreparedRandoms, index) < WordCloud.AdditionalRandomValue
                ? WordCloud.DefaultDT
                : -WordCloud.DefaultDT,
            shift: number = -dt,
            dx: number,
            dy: number;

        while (true) {
            shift += dt;

            point = this.archimedeanSpiral(shift);

            dx = Math.floor(point.x);
            dy = Math.floor(point.y);

            if (Math.min(Math.abs(dx), Math.abs(dy)) >= delta) {
                break;
            }

            word.x = startPoint.x + dx;
            word.y = startPoint.y + dy;

            if (word.x + word.x0 < WordCloud.DefaultX0
                || word.y + word.y0 < WordCloud.DefaultY0
                || word.x + word.x1 > this.specialViewport.width
                || word.y + word.y1 > this.specialViewport.height) {

                continue;
            }

            if (!borders || !this.checkIntersect(word, surface)) {
                if (!borders || this.checkIntersectOfRectangles(word, borders[0], borders[1])) {
                    let sprite: number[] = word.sprite,
                        width: number = word.width >> WordCloud.WidthOffset,
                        shiftWidth: number = this.specialViewport.width >> WordCloud.WidthOffset,
                        lx: number = word.x - (width << WordCloud.LxOffset),
                        sx: number = lx & WordCloud.SxMask,
                        msx: number = WordCloud.TheFirstByteMask - sx,
                        height: number = word.y1 - word.y0,
                        x: number = (word.y + word.y0) * shiftWidth + (lx >> WordCloud.WidthOffset);

                    for (let i: number = 0; i < height; i++) {
                        let lastSprite: number = 0;

                        for (let j: number = 0; j <= width; j++) {
                            let leftMask: number = lastSprite << msx,
                                rightMask: number;

                            if (j < width)
                                lastSprite = sprite[i * width + j];

                            rightMask = j < width
                                ? lastSprite >>> sx
                                : 0;

                            surface[x + j] |= leftMask | rightMask;
                        }

                        x += shiftWidth;
                    }

                    word.sprite = null;

                    return true;
                }
            }
        }

        return false;
    }

    private archimedeanSpiral(value: number): Point {
        const ratio: number = this.specialViewport.width / this.specialViewport.height;

        value = value * WordCloud.ArchimedeanFactor;

        return {
            x: ratio * value * Math.cos(value),
            y: value * Math.sin(value)
        };
    }

    private checkIntersect(word: WordCloudDataPoint, surface: number[]): boolean {
        let shiftWidth: number = this.specialViewport.width >> WordCloud.WidthOffset,
            sprite: number[] = word.sprite,
            widthOfWord: number = word.width >> WordCloud.WidthOffset,
            lx: number = word.x - (widthOfWord << WordCloud.LxOffset),
            sx: number = lx & WordCloud.SxMask,
            msx: number = WordCloud.TheFirstByteMask - sx,
            heightOfWord: number = word.y1 - word.y0,
            x: number = (word.y + word.y0) * shiftWidth + (lx >> WordCloud.WidthOffset);

        for (let i: number = 0; i < heightOfWord; i++) {
            let lastSprite: number = 0;

            for (let j: number = 0; j <= widthOfWord; j++) {
                let mask: number = 0,
                    leftMask: number,
                    intersectMask: number = 0;

                leftMask = lastSprite << msx;

                if (j < widthOfWord) {
                    lastSprite = sprite[i * widthOfWord + j];
                }

                mask = j < widthOfWord
                    ? lastSprite >>> sx
                    : 0;

                intersectMask = (leftMask | mask) & surface[x + j];

                if (intersectMask) {
                    return true;
                }
            }

            x += shiftWidth;
        }

        return false;
    }

    private checkIntersectOfRectangles(
        word: WordCloudDataPoint,
        leftBorder: Point,
        rightBorder: Point): boolean {

        return (word.x + word.x1) > leftBorder.x
            && (word.x + word.x0) < rightBorder.x
            && (word.y + word.y1) > leftBorder.y
            && (word.y + word.y0) < rightBorder.y;
    }

    /**
     * Returns a CanvasRenderingContext2D to compute size of the text.
     *
     * Public for testability.
     */
    public getCanvasContext(canvasElement: HTMLCanvasElement): CanvasRenderingContext2D {
        if (!canvasElement) {
            return null;
        }

        canvasElement.width = this.canvasViewport.width << WordCloud.WidthOffset;
        canvasElement.height = this.canvasViewport.height;

        const context = canvasElement.getContext("2d");

        context.fillStyle = context.strokeStyle = WordCloud.DefaultStrokeStyle;
        context.textAlign ="center"; 
        //context.textAlign =WordCloud.DefaultTextAlign as CanvasTextAlign;

        return context;
    }

    private updateSize(): void {
        let fakeWidth: number,
            fakeHeight: number,
            ratio: number;

        ratio = Math.sqrt((this.fakeViewport.width * this.fakeViewport.height)
            / (this.layout.viewportIn.width * this.layout.viewportIn.height));

        if (isNaN(ratio)) {
            fakeHeight = fakeWidth = WordCloud.MinFakeSize;
        } else {
            fakeHeight = this.layout.viewportIn.height * ratio;
            fakeWidth = this.layout.viewportIn.width * ratio;
        }

        this.specialViewport = {
            height: fakeHeight,
            width: fakeWidth
        };

        this.root.attr({
            "height": this.layout.viewport.height,
            "width": this.layout.viewport.width
        });
    }

    private render(wordCloudDataView: WordCloudDataView): void {
        if (!wordCloudDataView || !wordCloudDataView.data) {
            return;
        }

        this.scaleMainView(wordCloudDataView);

        this.wordsGroupUpdateSelection = this.main
            .select(WordCloud.Words.selectorName)
            .selectAll("g")
            .data(wordCloudDataView.data);

        let wordGroupEnterSelection: Selection<WordCloudDataPoint> = this.wordsGroupUpdateSelection
            .enter()
            .append("svg:g")
            .classed(WordCloud.WordGroup.className, true);

        wordGroupEnterSelection
            .append("svg:text")
            .style("font-size", WordCloud.DefaultTextFontSize);
        wordGroupEnterSelection
            .append("svg:rect");

        this.wordsGroupUpdateSelection
            .exit()
            .remove();

        this.wordsGroupUpdateSelection
            .attr("transform", (dataPoint: WordCloudDataPoint) => {
                return `${translate(dataPoint.x, dataPoint.y)} rotate(${dataPoint.rotate})`;
            })
            .sort((a: WordCloudDataPoint, b: WordCloudDataPoint) => {
                return b.height * b.width - a.height * a.width;
            });

        this.wordsTextUpdateSelection = this.wordsGroupUpdateSelection
            .selectAll("text")
            .data((dataPoint: WordCloudDataPoint) => [dataPoint]);

        this.wordsTextUpdateSelection.text((dataPoint: WordCloudDataPoint) => dataPoint.text);

        this.animateSelection(this.wordsTextUpdateSelection, this.durationAnimations)
            .style({
                "font-size": ((item: WordCloudDataPoint): string => PixelConverter.toString(item.size)),
                "fill": ((item: WordCloudDataPoint): string => item.color),     
                //"fill-opacity":0.3,           
                "fill-opacity":(item: WordCloudDataPoint): number => item.isHighlighted?item.highlighted?1.0
                :this.settings.general.TransparencyOfHighlight
                :1.0                    
            });
        
        this.wordsGroupUpdateSelection
            .selectAll("rect")
            .data((dataPoint: WordCloudDataPoint) => [dataPoint])
            .attr({
                x: (dataPoint: WordCloudDataPoint) => -dataPoint.getWidthOfWord() * WordCloud.XOffsetPosition,
                width: (dataPoint: WordCloudDataPoint) => dataPoint.getWidthOfWord(),
                y: (dataPoint: WordCloudDataPoint) => -dataPoint.size * WordCloud.YOffsetPosition,
                height: (dataPoint: WordCloudDataPoint) => dataPoint.size * WordCloud.HeightOffsetPosition,
                fill: () => WordCloud.TextFillColor,
            })
            .on("click", (dataPoint: WordCloudDataPoint) => {
                (d3.event as MouseEvent).stopPropagation();

                this.setSelection(dataPoint);
            });

        this.clearIncorrectSelection(this.data.dataView);
        this.renderSelection();
        this.renderTooltip(this.wordsGroupUpdateSelection);

        this.isUpdating = false;

        if (this.incomingUpdateOptions !== this.visualUpdateOptions) {
            this.update(this.incomingUpdateOptions);
        }
    }

    private clearIncorrectSelection(dataView: DataView): void {
        let categories: DataViewCategoryColumn[],
            identityKeys: string[],
            oldIdentityKeys: string[] = this.oldIdentityKeys;

        categories = dataView
            && dataView.categorical
            && dataView.categorical.categories;

        identityKeys = categories
            && categories[0]
            && categories[0].identity
            && categories[0].identity.map((identity:DataViewScopeIdentity) => identity.toString());

        this.oldIdentityKeys = identityKeys;

        if (oldIdentityKeys && oldIdentityKeys.length > identityKeys.length) {
            this.selectionManager.clear(false);

            return;
        }

        if (!_.isEmpty(identityKeys)) {
            let incorrectValues: SelectionIdValues<string>[] = this.selectionManager
                .getSelectionIdValues
                .filter((idValue: SelectionIdValues<string>) => {
                    return idValue.selectionId.some((selectionId: ISelectionId) => {
                        return _.includes(identityKeys, selectionId.getKey());
                    });
                });

            incorrectValues.forEach((value: SelectionIdValues<string>) => {
                this.selectionManager
                    .selectedValues
                    .splice(this.selectionManager
                        .selectedValues
                        .indexOf(value.value), 1);
            });
        }
    }

    private setSelection(dataPoint: WordCloudDataPoint): void {
        if (!dataPoint) {
            this.clearSelection();

            return;
        }

        this.selectionManager
            .selectAndSendSelection(dataPoint.text, (d3.event as MouseEvent).ctrlKey);
        this.renderSelection();
    }

    private clearSelection(): void {
        this.selectionManager
            .clear(true);
        this.renderSelection();
    }

    private scaleMainView(wordCloudDataView: WordCloudDataView): void {
        const rectangles: ClientRect[] = wordCloudDataView.data.map((dataPoint: WordCloudDataPoint) => {
            const hw: number = dataPoint.width / 2,
                hh: number = dataPoint.height / 2;
            
            return {
                left: dataPoint.x - hw,
                top: dataPoint.y - hh,
                right: dataPoint.x + hw,
                bottom: dataPoint.y + hh
            } as ClientRect;
        });

        if (_.isEmpty(rectangles)) {
            return;
        }

        const rectangle: ClientRect = {
            left: _.minBy(rectangles, (rect: ClientRect) => rect.left).left,
            top: _.minBy(rectangles, (rect: ClientRect) => rect.top).top,
            right: _.maxBy(rectangles, (rect: ClientRect) => rect.right).right,
            bottom: _.maxBy(rectangles, (rect: ClientRect) => rect.bottom).bottom
        } as ClientRect;

        const rectWidth: number = rectangle.right - rectangle.left,
            rectHeight: number = rectangle.bottom - rectangle.top;

        const scaleByX: number = this.layout.viewportIn.width / rectWidth,
            scaleByY: number = this.layout.viewportIn.height / rectHeight,
            scale: number = Math.min(scaleByX, scaleByY);

        const x: number = -rectangle.left * scale + WordCloud.ScalePositionOffset,
            y: number = -rectangle.top * scale + WordCloud.ScalePositionOffset;

        /**
         * Note: This construction fixes bug #6343.
         * Edge renders words out of the canvas, so we use this hack to fix it.
         * The line-height doesn't work with svg, but it call the render cycle of the browser.
         */
        this.main
            .style("line-height", WordCloud.TheFirstLineHeight); // Note: This construction fixes bug #6343.

        this.main
            .attr("transform", translateAndScale(x, y, scale))
            .style("line-height", WordCloud.TheSecondLineHeight); // Note: This construction fixes bug #6343.
    }

    private renderSelection(): void {
        if (!this.wordsTextUpdateSelection) {
            return;
        }

        if (!this.selectionManager.hasSelection) {
            this.setOpacity(this.wordsTextUpdateSelection, WordCloud.MaxOpacity);

            return;
        }

        const selectedColumns: UpdateSelection<WordCloudDataPoint> = this.wordsTextUpdateSelection
            .filter((dataPoint: WordCloudDataPoint) => {
                return this.selectionManager.isSelected(dataPoint.text);
            });

        this.setOpacity(this.wordsTextUpdateSelection, WordCloud.MinOpacity);
        this.setOpacity(selectedColumns, WordCloud.MaxOpacity);
    }

    private setOpacity(element: Selection<any>, opacityValue: number): void {
        element.style("fill-opacity", opacityValue);

        if (this.main) { // Note: This construction fixes bug #6343.
            this.main.style("line-height", WordCloud.TheThirdLineHeight);

            this.animateSelection(this.main, 0, this.durationAnimations)
                .style("line-height", WordCloud.TheFourthLineHeight);
        }
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        //return WordCloudSettings.enumerateObjectInstances(this.settings || WordCloudSettings.getDefault(), options);        
        const settings: WordCloudSettings = this.settings
            ? this.settings
            : WordCloudSettings.getDefault() as WordCloudSettings;

        let instanceEnumeration: VisualObjectInstanceEnumeration =
            WordCloudSettings.enumerateObjectInstances(settings, options);
        switch (options.objectName) {
            case "dataPoint": {
                if (this.data && this.data.dataPoints) {
                    this.enumerateDataPoint(options, instanceEnumeration);
                }

                break;
            }
        }

        return instanceEnumeration || [];
    }
    private enumerateDataPoint(
        options: EnumerateVisualObjectInstancesOptions,
        instanceEnumeration: VisualObjectInstanceEnumeration): void {

        let uniqueDataPoints: WordCloudDataPoint[] = _.uniqBy(
            this.data.dataPoints,
            (dataPoint: WordCloudDataPoint) => dataPoint.wordIndex);

        this.enumerateDataPointColor(uniqueDataPoints, options, instanceEnumeration);
    }

    private enumerateDataPointColor(
        dataPoints: WordCloudDataPoint[],
        options: EnumerateVisualObjectInstancesOptions,
        instanceEnumeration: VisualObjectInstanceEnumeration): void {

        let wordCategoriesIndex: number[] = [];
        dataPoints.forEach((item: WordCloudDataPoint) => {
            if (wordCategoriesIndex.indexOf(item.wordIndex) === -1) {
                let instance: VisualObjectInstance;

                wordCategoriesIndex.push(item.wordIndex);
                instance = {
                    objectName: options.objectName,
                    displayName: this.data.texts[item.wordIndex].text,
                    selector: ColorHelper.normalizeSelector(
                        item.selectionIds[0].getSelector(),
                        false),
                    properties: { fill: { solid: { color: item.color } } }
                };
                this.addAnInstanceToEnumeration(instanceEnumeration, instance);
            }
        });

    }

    private addAnInstanceToEnumeration(
        instanceEnumeration: VisualObjectInstanceEnumeration,
        instance: VisualObjectInstance): void {

        if ((instanceEnumeration as VisualObjectInstanceEnumerationObject).instances) {
            (instanceEnumeration as VisualObjectInstanceEnumerationObject)
                .instances
                .push(instance);
        } else {
            (instanceEnumeration as VisualObjectInstance[]).push(instance);
        }
    }

    private animateSelection<T extends Selection<any>>(
        element: T,
        duration: number = 0,
        delay: number = 0,
        callback?: (data: any, index: number) => void): Transition<any> {

        return element
            .transition()
            .delay(delay)
            .duration(duration)
            .each("end", callback);
    }
    private renderTooltip(selection: UpdateSelection<WordCloudDataPoint>): void {
        let categorical: WordCloudColumns<DataViewCategoryColumn> = WordCloudColumns.getCategoricalColumns(this.incomingUpdateOptions.dataViews[0]),
            wordValueFormatter: IValueFormatter = null;

        if (categorical.Values && categorical.Values[0]) {
            wordValueFormatter = ValueFormatter.create({
                format: ValueFormatter.getFormatStringByColumn(categorical.Values[0].source)
            });
        }

        this.tooltipService.addTooltip(selection, (tooltipEvent: TooltipEventArgs<WordCloudDataPoint>) => {
            let item = wordValueFormatter !== null ? wordValueFormatter.format(tooltipEvent.data.count) : tooltipEvent.data.count;
            return [{
                displayName: tooltipEvent.data.text,
                value: item.toString()
            }];
        });
    }

    public destroy(): void {
        this.root = null;
    }
    private static getReducedText(
        texts: WordCloudText[],
        excludedWords: WordMap,
        settings: WordCloudSettings): WordCloudGroup[] {

        const brokenStrings: WordCloudText[] = WordCloud.processText(texts, excludedWords, settings);
        const combinedMap: { [text: string]: WordCloudGroup } = Object.create(null);
        const result: WordCloudGroup[] = [];
        brokenStrings.forEach((item: WordCloudText) => {
            const key = item.text.toLocaleLowerCase();
            if (combinedMap[key]) {
                combinedMap[key].count += item.count;
                combinedMap[key].selectionIds.push(item.selectionId);
            } else {
                combinedMap[key] = {
                    text: item.text,
                    wordIndex: item.index,
                    selectionIds: [item.selectionId],
                    count: item.count,
                    color: item.color
                };
            }
        });

        for (let key in combinedMap) {
            if (settings.general.minRepetitionsToDisplay <= combinedMap[key].count) {
                result.push(combinedMap[key]);
            }
        }

        return result;
    }

    private static CleanAndSplit(item: string, settings: WordCloudSettings): string[] {
        if (!settings.general.isPunctuationsCharacters) {
            return item.replace(this.punctuationRegExp, " ").split(this.whiteSpaceRegExp);
        }
        return item.split(WordCloud.whiteSpaceRegExp);
    }

    private static getStopWords(settings: WordCloudSettings): WordMap {
        const map: WordMap = Object.create(null);
        if (!settings.stopWords.show) return map;
        if (!!settings.stopWords.words && _.isString(settings.stopWords.words)) {
            settings.stopWords.words
                .split(WordCloud.StopWordsDelimiter)
                .forEach((word: string) => {
                    word = word.toLocaleLowerCase();
                    if (!map[word]) map[word] = true;
                });
        }
        if (settings.stopWords.isDefaultStopWords) {
            WordCloud.StopWords
                .forEach((word: string) => {
                    word = word.toLocaleLowerCase();
                    if (!map[word]) map[word] = true;
                });
        }
        return map;
    }

    private static getExcludes(excluded: PrimitiveValue[], settings: WordCloudSettings): WordMap {
        const map: WordMap = Object.create(null);
        excluded.forEach((item: PrimitiveValue) => {
            if (typeof item !== "string" && typeof item !== "number") return;
            // Filters should keep the same rules that target words
            this.CleanAndSplit(item.toString(), settings).forEach((word: string) => {
                word = word.toLocaleLowerCase();
                if (!map[word]) map[word] = true;
            });
        });

        return { ...map, ...this.getStopWords(settings) };
    }

    private static processText(
        words: WordCloudText[],
        excludedWords: WordMap,
        settings: WordCloudSettings): WordCloudText[] {
        const processedText: WordCloudText[] = [];

        words.forEach((item: WordCloudText) => {
            if (typeof item.text !== "string") {
                processedText.push(item);
                return;
            }
            let splittedWords: string[] = this.CleanAndSplit(item.text, settings);

            splittedWords = this.getFilteredWords(splittedWords, excludedWords);

            processedText.push(...settings.general.isBrokenText
                ? WordCloud.getBrokenWords(splittedWords, item)
                : WordCloud.getFilteredSentences(splittedWords, item, settings)
            );
        });

        return processedText;
    }

    private static getBrokenWords(
        splittedWords: string[],
        item: WordCloudText): WordCloudText[] {

        const brokenStrings: WordCloudText[] = [];

        splittedWords.forEach((splittedWord: string) => {
            if (splittedWord.length === 0 || this.whiteSpaceRegExp.test(splittedWord)) return;

            brokenStrings.push({
                ...item,
                text: splittedWord
            });
        });

        return brokenStrings;
    }

    private static getFilteredSentences(
        splittedWords: string[],
        item: WordCloudText,
        settings: WordCloudSettings): WordCloudText[] {
        if (splittedWords.length === 0) return [];

        if (!settings.general.isPunctuationsCharacters) {
            item.text = item.text
                .replace(this.punctuationRegExp, " ");
        }

        return [item];
    }

    private static getFilteredWords(
        words: string[],
        excluded: WordMap) {
        return words.filter((value: string) => value.length > 0 && !excluded[value.toLocaleLowerCase()]);
    }

    private static getDataPoints(
        textGroups: WordCloudGroup[],
        settings: WordCloudSettings,
        dataView:DataView): WordCloudDataPoint[] {

        if (_.isEmpty(textGroups)) {
            return [];
        }
        let highlights=dataView.categorical.values[0].highlights;  //从数据视图中取值
        const returnValues: WordCloudDataPoint[] = textGroups.map((group: WordCloudGroup, index: number) => {
            return {
                x: WordCloud.DefaultX,
                y: WordCloud.DefaultY,
                padding: WordCloud.DefaultPadding,
                width: WordCloud.DefaultWidth,
                height: WordCloud.DefaultHeight,
                xOff: WordCloud.DefaultXOff,
                yOff: WordCloud.DefaultYOff,
                x0: WordCloud.DefaultX0,
                y0: WordCloud.DefaultY0,
                x1: WordCloud.DefaultX1,
                y1: WordCloud.DefaultY1,
                text: group.text,
                rotate: WordCloud.getAngle(settings, index),
                color: group.color,
                selectionIds: group.selectionIds,
                wordIndex: group.wordIndex,
                count: group.count,
                isHighlighted:highlights?true:false,
                highlighted:highlights?highlights[index]?true:false:false,
            } as WordCloudDataPoint;
        }).sort((a, b) => b.count - a.count);

        const minValue: number = returnValues[returnValues.length - 1].count,
            maxValue: number = returnValues[0].count;

        returnValues.forEach((dataPoint: WordCloudDataPoint) => {
            dataPoint.size = WordCloud.getWordFontSize(
                settings,
                dataPoint.count,
                minValue,
                maxValue);
        });

        return returnValues.sort((firstDataPoint: WordCloudDataPoint, secondDataPoint: WordCloudDataPoint) => {
            return secondDataPoint.count - firstDataPoint.count;
        });
    }

    private static getWordFontSize(
        settings: WordCloudSettings,
        value: number,
        minValue: number,
        maxValue: number,
        scaleType: WordCloudScaleType = WordCloudScaleType.value) {

        let weight: number,
            fontSize: number,
            minFontSize: number = settings.general.minFontSize * GeneralSettings.FontSizePercentageFactor,
            maxFontSize: number = settings.general.maxFontSize * GeneralSettings.FontSizePercentageFactor;

        weight = WordCloud.getWeightByScaleType(value, scaleType);

        if (weight > minValue) {
            fontSize = (maxValue - minValue) !== WordCloud.MinFontSize
                ? (maxFontSize * (weight - minValue)) / (maxValue - minValue)
                : WordCloud.MinFontSize;
        } else {
            fontSize = WordCloud.MinFontSize;
        }

        fontSize = (fontSize * WordCloud.FontSizePercentage) / maxFontSize;

        fontSize = (fontSize * (maxFontSize - minFontSize)) / WordCloud.FontSizePercentage + minFontSize;

        return fontSize;
    }

    private static getWeightByScaleType(
        value: number,
        scaleType: WordCloudScaleType = WordCloudScaleType.value): number {

        switch (scaleType) {
            case WordCloudScaleType.logn: {
                return Math.log(value);
            }
            case WordCloudScaleType.sqrt: {
                return Math.sqrt(value);
            }
            case WordCloudScaleType.value:
            default: {
                return value;
            }
        }
    }

    /**
     * Uses to iterate by custom array cyclically.
     * The starting index can be changed with offset.
     */
    public static getFromCycledSequence(targetArray: number[], index: number, offset: number = 0): number {
        let currentIndex: number = index + offset;
        let seqLength = targetArray.length;

        if (currentIndex >= seqLength) {

            currentIndex = currentIndex % seqLength;
        }

        return targetArray[currentIndex];
    }

    private static getAngle(settings: WordCloudSettings, index: number): number {
        if (!settings.rotateText.show) {
            return WordCloud.DefaultAngle;
        }

        const angle: number = ((settings.rotateText.maxAngle - settings.rotateText.minAngle)
            / settings.rotateText.maxNumberOfOrientations)
            * Math.floor(WordCloud.getFromCycledSequence(WordCloud.PreparedRandoms, index) * settings.rotateText.maxNumberOfOrientations);

        return settings.rotateText.minAngle + angle;
    }

}