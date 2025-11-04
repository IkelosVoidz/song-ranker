# Song Ranker

A modernized song ranking tool built on top of the original [Bias Sorter](https://biasorter.tumblr.com/post/175232387900/sorter-code-and-instructions-to-it) by biasorter. Uses merge sort to efficiently rank your songs through head-to-head comparisons.

## What's New

This version keeps the solid sorting algorithm from the original but adds some quality of life improvements:

**Config-Driven Everything**  
No more editing JavaScript files. Just drop your songs into `config.json` and you're good to go.

**Custom Theming**  
- Light or dark mode depending on your background
- Image backgrounds or gradient backgrounds
- Everything adjusts automatically so text is always readable

**Drag & Drop Reordering**  
After you finish ranking, you can manually drag songs around to tweak the order. Works on both desktop and mobile. The copied text updates to match your changes.

**Better UX**  
- Undo button to go back if you misclick
- Clean UI with smooth animations
- Mobile-friendly comparison buttons

**Modern Stack**  
Uses CSS custom properties for dynamic theming, ES6+ JavaScript, and proper mobile touch events.

## Setup

1. Clone or download this repo
2. Replace `config.json` with your own (see `config-sample.json` for the structure)
3. Add your images to the `img/` folder
4. Open `index.html` in a browser


## Config Structure

```json
{
  "title": "Your Ranker Title",
  "description": "Instructions for users (supports HTML)",
  "headerImage": "img/your-header.png",
  "background": {
    "type": "gradient",
    "gradientStart": "#667eea",
    "gradientEnd": "#764ba2"
  },
  "theme": "dark",
  "songs": [
    { "name": "Song 1", "image": "img/album.png" },
    { "name": "Song 2", "image": "img/album.png" }
  ]
}
```

### Background Options

**Gradient:**
```json
"background": {
  "type": "gradient",
  "gradientStart": "#667eea",
  "gradientEnd": "#764ba2"
}
```

**Image:**
```json
"background": {
  "type": "image",
  "value": "img/background.png"
}
```

### Theme

- `"dark"` - White text with dark shadows (for dark backgrounds)
- `"light"` - Dark text with light shadows (for bright backgrounds)

The theme controls all text, buttons, and borders to make sure everything's readable.

## Credits

Original sorter algorithm and concept by [biasorter](https://biasorter.tumblr.com/post/175232387900/sorter-code-and-instructions-to-it).

Feel free to fork as long as you give credit to the original author.

## License

Same as the original - use it however you want. If you make something cool with it, let me know!
