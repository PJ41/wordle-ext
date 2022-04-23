function main() {
  var link = chrome.runtime.getURL("scripts/features.js");
  var script = document.createElement('script');
  script.type="text/javascript";
  script.src= link;
  document.getElementsByTagName('head')[0].appendChild(script)
}

main();
