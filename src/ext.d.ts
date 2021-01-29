declare module 'm3u8-to-mp4' {
    export default class {
        setInputFile(str: string): this;
        setOutputFile(str: string): this;
        start(): Promise<void>;
    }
}