import Showdown from "showdown";
require('showdown-youtube');

export const converter = new Showdown.Converter({extensions: ['youtube'], tables: true, emoji: true, strikethrough: true, underline: true});
