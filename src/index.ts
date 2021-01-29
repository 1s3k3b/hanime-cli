#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { Client, Video } from 'hanime-api';
import { Lexer, Parser, longShortStrategy } from 'lexure';
import {
    blue,
    yellow,
    green,
    format,
    findBestTag,
    random,
    render,
    info,
    split,
    splitStoryboard,
    table,
    findBestStream,
    download,
} from './util';

const client = new Client();
const res = new Parser(
    new Lexer(
        process.argv
            .slice(2)
            .join(' ')
    ).lex()
)
    .setUnorderedStrategy(longShortStrategy())
    .parse();

const command = res.ordered.shift()?.value.toLowerCase();
const text = res.ordered
    .map(x => x.raw)
    .join(' ');

(async () => {
    switch (command) {
    case 'random':
    case 'all': {
        const output = res.options.get('output')?.[0];
        const start = Date.now();
        const [vid, results, end]: [Video | undefined, number, number] = await client
            .fetchVideo(text)
            .then(d => <[Video, number, number]>[d, 1, Date.now()])
            .catch(() =>
                client
                    .searchAll(
                        text,
                        {
                            tags: res.options
                                .get('tag')
                                ?.map(findBestTag),
                            tagMode: <'and' | 'or'>res.options.get('tagmode')?.[0],
                            brands: res.options.get('brand'),
                            blacklist: res.options
                                .get('blacklist')
                                ?.map(findBestTag),
                        },
                    )
                    .then(async d => [await random(d)?.fetch(), d.length, Date.now()])
            );
        if (!vid) return console.log('No matching video found.');
        const [story] = vid.storyboards;
        const images = await splitStoryboard(story);
        console.log(info(vid, results, start, end));
        console.log(`Storyboard: ${blue(story.url)}
${format(story.frames.total)} total images
${format(story.frames.horizontal)} horizontal images
${format(story.frames.vertical)} vertical images
${format(story.frames.width)} image width
${format(story.frames.height)} image height`);
        if (command === 'random') {
            const outFile = output || `./${vid.data.id}.png`;
            writeFileSync(outFile, render(story.frames.width, story.frames.height, random(images)));
            console.log(`Successfully saved ${blue(outFile)}`);
        } else {
            const outDir = output ? output.endsWith('/') ? output : `${output}/` : `./${vid.data.id}/`;
            if (!existsSync(outDir)) mkdirSync(outDir);
            let i = 0;
            for (const img of images) writeFileSync(`${outDir}${++i}.png`, render(story.frames.width, story.frames.height, img));
            console.log(`Successfully saved ${format(i)} images to ${yellow(outDir)}`);
        }
        break;
    }
    case 'download': {
        const start = Date.now();
        const [vid, results, end]: [Video | undefined, number, number] = await client
            .fetchVideo(text)
            .then(d => <[Video, number, number]>[d, 1, Date.now()])
            .catch(() =>
                client
                    .search(text)
                    .then(async d => [await d.videos[0]?.fetch(), d.videoCount, Date.now()])
            );
        if (!vid) return console.log('No matching video found.');
        const stream = findBestStream(vid);
        console.log(info(vid, results, start, end));
        download(stream.id, vid.data.slug)
            .then(() => console.log(`Successfully downloaded ${vid.data.name} to ${vid.data.slug}.mp4.`));
        break;
    }
    case 'tags':
        return console.log(table(
            split(
                (await client.fetchTags())
                    .sort((a, b) => b.videos - a.videos)
                    .map(x => `${blue(x.name)} (${format(x.videos)} videos) - ${x.description}`),
                2
            ),
            5,
        ));
    case 'brands':
        return console.log(table(split(
            (await client.fetchBrands())
                .sort((a, b) => b.uploads - a.uploads)
                .map(x => `${blue(x.title)} (${format(x.uploads)} uploads)`),
            4,
        )));
    default:
        console.log(`${yellow('Hanime CLI')}

${yellow('A CLI app for interacting with hanime.tv.')}

Commands:
    hanime <${green('all|random')}> [${blue('query')}] [--${blue('tag')}=${blue('tag1')} --${blue('tag')}=${blue('tag2')} --${blue('tag')}=...] [--${blue('blacklist')}=${blue('tag1')} --${blue('blacklist')}=${blue('tag2')} --${blue('blacklist')}=...] [--${blue('brand')}=...] [--${blue('tagmode')}=${blue('and|or')}] [--${blue('output')}=...]
    ${yellow('Splits a randomly picked video\'s storyboard into seperate images.')}
    Args:
        <${green('all|random')}>: Whether to save all storyboard images of the video, or only pick a random one to save.
        [${blue('query')}]: The query to search for, or the video's ID.
        [--${blue('tag')}]: The tag names to search for.
        [--${blue('blacklist')}]: The tag names to blacklist.
        [--${blue('brand')}]: The brand to search videos from.
        [--${blue('tagmode')}]: The method to search tags by.
        [--${blue('output')}]: The output file/directory.
    Examples:
        ${green('hanime all --blacklist=rape --blacklist=futa --blacklist=trap --tag=bigboobs --tag=boobjob --tag=vanilla')}
        ${green('hanime all kimi omou koi 1')}
        ${green('hanime random tenioha --blacklist=trap --output=pics/tenioha.png')}

    hanime download <${blue('query')}>
    ${yellow('Downloads the best quality available of the found video in an .mp4 file.')}
    Args:
        <${blue('query')}>: The query to search for, or the video's ID.
    Examples:
        ${green('hanime download shishunki sex 3')}
        ${green('hanime download overflow')}

    hanime ${green('tags')}
    ${yellow('Gives a list of tags.')}

    hanime ${green('brands')}
    ${yellow('Gives a list of brands.')}
`);
    }
})();