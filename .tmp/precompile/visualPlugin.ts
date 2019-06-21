import { WordCloud } from "../../src/visual";
var powerbiKey = "powerbi";
var powerbi = window[powerbiKey];

var wordCloud07983E11E5FB4C8BB44B66D20BD904B9_DEBUG = {
    name: 'wordCloud07983E11E5FB4C8BB44B66D20BD904B9_DEBUG',
    displayName: 'WordCloud-luojiandan',
    class: 'WordCloud',
    version: '1.0.0',
    apiVersion: '2.6.0',
    create: (options) => {
        if (WordCloud) {
            return new WordCloud(options);
        }

        console.error('Visual instance not found');
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["wordCloud07983E11E5FB4C8BB44B66D20BD904B9_DEBUG"] = wordCloud07983E11E5FB4C8BB44B66D20BD904B9_DEBUG;
}

export default wordCloud07983E11E5FB4C8BB44B66D20BD904B9_DEBUG;