import powerbi from "powerbi-visuals-api";
import IViewport = powerbi.IViewport;
import { IMargin } from "powerbi-visuals-utils-svgutils";
export declare class VisualLayout {
    private marginValue;
    private viewportValue;
    private viewportInValue;
    private minViewportValue;
    private originalViewportValue;
    private previousOriginalViewportValue;
    defaultMargin: IMargin;
    defaultViewport: IViewport;
    constructor(defaultViewport?: IViewport, defaultMargin?: IMargin);
    viewport: IViewport;
    readonly viewportCopy: IViewport;
    readonly viewportIn: IViewport;
    minViewport: IViewport;
    margin: IMargin;
    readonly viewportChanged: boolean;
    readonly viewportInIsZero: boolean;
    resetMargin(): void;
    private update;
    private setUpdateObject;
    private static createNotifyChangedObject;
    private static restrictToMinMax;
}
