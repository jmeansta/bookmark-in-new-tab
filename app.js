function $(id) {return document.getElementById(id)}

function newElement(id) {
  var folder = document.createElement("p")
  folder.innerHTML = id;
  $("bookmarkBar").appendChild(folder)
}

function l(message) {
  console.log(message)
}

async function restoreOptions() {
  const options = await browser.storage.local.get(["selectedFolders"]);
  console.log(options)
  options.selectedFolders.forEach((id) => newElement(id));
};

window.addEventListener( 'load', restoreOptions );
