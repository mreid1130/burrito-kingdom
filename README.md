# BurritoKingdom

[![NPM version](http://img.shields.io/npm/v/burrito-kingdom.svg)](https://www.npmjs.org/package/burrito-kingdom)

In Burrito Kingdom, you have little say over the images used in your projects. In Burrito Kingdom, we replace every image file in a directory of your choice with a random Google image based on keyword(s) of your choice.

## Functions
### burritorizeFolder(directory, keywords, safeSearch, callback)

Replaces all of the image files in the relative directory with Google image search results.

__Arguments__

* `directory` - Relative path (string) to the directory you'd like to fill with random images.
* `keywords` - Single string of keywords as you would type into a Google search bar. If set to `null`, `''`, or any other `false`-y value, the search term will default to the name of the file being replaced.
* `safeSearch` - `true` or `false`.

__Example__

```js
var burritoKingdom = require('burrito-kingdom');

var directory = './public/imgs';
var keywords = 'burrito';
var safeSearch = false;

burritoKingdom.burritorizeFolder('./public/imgs', 'burrito', false, function(){
	// All images in the ./public/imgs folder have been replaced by burritos!
});

```

### burritoWatch(directory, keywords, safeSearch)

Like `burritorizeFolder`, except that it continues to watch the directory for one additional change per file (or any added file).

__Arguments__

* `directory` - Relative path (string) to the directory you'd like to fill with random images.
* `keywords` - Single string of keywords as you would type into a Google search bar. If set to `null`, `''`, or any other `false`-y value, the search term will default to the name of the file being replaced.
* `safeSearch` - `true` or `false`.

__Example__

```js
var burritoKingdom = require('burrito-kingdom');

var directory = './public/imgs';
var keywords = 'burrito';
var safeSearch = false;

burritoKingdom.burritoWatch('./public/imgs', 'burrito', false);
// ./public/imgs will be filled with burritos. If one
// of those images was changed to something else, it will
// turn it back into a burrito picture (up to once per file).
// It will also replace any image added to that folder
// (while running) with a burrito.

```