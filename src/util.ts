import { Storyboard, constants, Video } from 'hanime-api';
import { findBestMatch } from 'string-similarity';
import { createCanvas } from 'canvas';
import Converter from 'm3u8-to-mp4';
import Jimp from 'jimp';
import { TagName } from 'hanime-api/typings/src/util/types';
import { hex } from 'chalk';

const M3U8_URL = 'https://weeb.hanime.tv/weeb-api-cache/api/v8/m3u8s/';

export const green = hex('#23db85');
export const blue = hex('#0388fc');
export const yellow = hex('#f0da3a');
export const format = (n: number | Date) => n instanceof Date
    ? blue(n.toDateString())
    : green(n.toLocaleString('en'));

export const split = <T>(a: T[], n: number) => a.reduce(
    (a, b) =>
        a[a.length - 1].length === n
            ? [...a, [b]]
            : [...a.slice(0, -1), [...a[a.length - 1], b]],
    <T[][]>[[]],
);

export const invert2D = <T>(a: T[][]) => a.reduce(
    (a, b) =>
        b.map((x, i) => (a[i] || (a[i] = [])).push(x)) && a,
    <T[][]>[]
);

export const table = (a: string[][], space = 10) =>
    invert2D(
        invert2D(a)
            .map(x => x.map(s => s + ' '.repeat(x.sort((a, b) => b.length - a.length)[0].length - s.length + space)))
    )
        .map(x => x.join(''))
        .join('\n');

export const info = (vid: Video, ...[results, start, end]: number[]) => `${format(results)} results in ${green(((end - start) / 1000).toFixed(2))} seconds
${yellow(vid.data.name)} (${blue(vid.data.url)})

${yellow(vid.data.description)}

${format(vid.data.likes)} likes
${format(vid.data.dislikes)} dislikes
${format(vid.data.views)} views
${green('#')}${format(vid.data.monthlyRank)} monthly
${blue(vid.data.censored ? 'Censored' : 'Uncensored')}
Created at ${format(vid.data.createdAt)}
Released at ${format(vid.data.releasedAt)}
Tags:
${table(split(vid.tags.map(x => `${blue(x.name)} (${format(x.videos)} videos) - ${x.description}`), 2), 5)}
`;

export const random = <T>(a: T[]) => a[~~(Math.random() * a.length)];

export const findBestTag = (s: string) => <TagName>findBestMatch(s, <string[]><unknown>constants.TAGS).bestMatch.target;

export const findBestStream = (v: Video) => v.manifest.servers
    .flatMap(x => x.streams)
    .sort((a, b) => +b.height - +a.height)[0];

export const download = (id: number, name: string) => new Converter()
    .setInputFile(`${M3U8_URL}${id}.m3u8`)
    .setOutputFile(name + '.mp4')
    .start();

export const splitStoryboard = (s: Storyboard): Promise<Image[]> => Jimp
    .read(s.url)
    .then(d => {
        const images: Image[] = [];
        for (let y = 0; y < s.frames.vertical; y++) {
            for (let x = 0; x < s.frames.horizontal; x++) {
                images.push(
                    Array
                        .from({ length: s.frames.height }, (_, i) => i)
                        .flatMap((y2): Image =>
                            Array.from(
                                { length: s.frames.width },
                                (_, i) => [
                                    i,
                                    y2,
                                    Object.values(Jimp.intToRGBA(d.getPixelColor(x * s.frames.width + i, y * s.frames.height + y2))),
                                ]
                            )
                        )
                );
            }
        }
        return images;
    })
    .catch(() => splitStoryboard({ ...s, url: s.url.replace(/-v(\d)x\./g, (_, n) => `-v${3 - n}x.`) }));

export const rgbToHex = ([r, g, b]: number[]) => '#' + ((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1);

export const render = (w: number, h: number, img: Image) => {
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');
    for (const [x, y, rgb] of img) {
        ctx.beginPath();
        ctx.fillStyle = rgbToHex(rgb);
        ctx.fillRect(x, y, 1, 1);
    }
    return canvas.toBuffer();
};

type Image = [number, number, number[]][];