# Hanime CLI
A CLI app for splitting hanime.tv video storyboards into seperate images, as well as downloading videos. It also gives basic info about videos, tags, and brands.

# Installation
- [Install Node.js](https://nodejs.org/) >=10 if you haven't already.
- Clone or download the repository
- `npm i`
- `npm ls typescript -g || npm i typescript -g`
- `tsc && npm i . -g`
- The `hanime` command should now be available.

# Commands

### `hanime <all|random> [query] [--tag=tag1 --tag=tag2 --tag=...] [--blacklist=tag1 --blacklist=tag2 --blacklist=...] [--brand=...] [--tagmode=and|or] [--output=...]`<br>
Splits a randomly picked video's storyboard into seperate images.<br>
#### Args:
- `<all|random>`: Whether to save all storyboard images of the video, or only pick a random one to save.
- `[query]`: The query to search for.
- `[--tag]`: The tag names to search for.
- `[--blacklist]`: The tag names to blacklist.
- `[--brand]`: The brand to search videos from.
- `[--tagmode]`: The method to search tags by.
- `[--output]`: The output file/directory.<br>
#### Examples:
- `hanime all --blacklist=rape --blacklist=futa --blacklist=trap --tag=bigboobs --tag=boobjob --tag=vanilla`
- `hanime all kimi omou koi 1`
- `hanime random tenioha --blacklist=trap --output=pics/tenioha.png`
<br>

### `hanime download <query>`
Downloads the best quality available of the found video in an .mp4 file.
#### Args:
- `<query>`: The query to search for, or the video's ID.
#### Examples:
- `hanime download shishunki sex 3`
- `hanime download overflow`
<br>

### `hanime tags`
Gives a list of tags.
<br>

### `hanime brands`
Gives a list of brands.

# Showcase

<img src="https://raw.githubusercontent.com/1s3k3b/hanime-cli/master/images/all.png"><br>
<img src="https://raw.githubusercontent.com/1s3k3b/hanime-cli/master/images/random.png"><br>
<img src="https://raw.githubusercontent.com/1s3k3b/hanime-cli/master/images/tags.png"><br>
<img src="https://raw.githubusercontent.com/1s3k3b/hanime-cli/master/images/brands.png"><br>
<img src="https://raw.githubusercontent.com/1s3k3b/hanime-cli/master/images/help.png"><br>