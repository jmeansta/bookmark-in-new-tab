function $(id) {return document.getElementById(id)}

const saveOptions = async e => {
  var options = {};
  var selectedBmNodes = [];

  var collection = document.getElementsByClassName("bmNodeCheckbox")
  for (var c in collection) {
    if (collection[c].checked) {
      selectedBmNodes.push(collection[c].id)
    }
  }

  options.selectedBmNodes = selectedBmNodes;
  await browser.storage.local.set( options );
};


const restoreOptions = async _ => {
  const options = await browser.storage.local.get();
  options.selectedBmNodes.forEach((id) => $(id).checked = true);
};

function newElement(bookmarkItem,indent) {
  
  var rowItem = document.createElement("div");
  var input = document.createElement("input");
  var label = document.createElement("label");

  input.type = "checkbox";
  input.id = bookmarkItem.id;
  rowItem.appendChild(input)

  label.innerHTML = bookmarkItem.title;
  label.htmlFor = bookmarkItem.id;
  rowItem.appendChild(label)

  input.classList.add("bmNodeCheckbox");
  // rowItem.title = indent.toString()+" - "+bookmarkItem.id;
  rowItem.style = "margin: 0px; margin-left: " + indent*40 + "px;"
  rowItem.classList.add("treeItem")
  if (bookmarkItem.url) {
    rowItem.classList.add("bookmark")
    rowItem.title = bookmarkItem.url;
  } else {
    rowItem.classList.add("folder")
  }
  // rowItem.title = rowItem.classList

  if (bookmarkItem.url == "data:") {
    // horizontal rules turn into boxes when they have innerHTML
    // I elected to just overwrite the "rowItem" variable in this case
    var rowItem = document.createElement("hr"); // separators
    rowItem.align = "right";
    rowItem.width = $("bmForm").clientWidth-indent*40 + "px";
  }
  $("bmForm").appendChild(rowItem)
}

function traverseTree(bookmarkItem, indent, printingChildren) {
  if (printingChildren) {
    newElement(bookmarkItem,indent)
  }

  if (bookmarkItem.children) {
    if (bookmarkItem.id != "root________") {
      indent++;
    }
    for (const child of bookmarkItem.children) {
      // if (printingChildren || bookmarkItem.id == "toolbar_____") {
      if (printingChildren || bookmarkItem.id == "root________") {
        traverseTree(child, indent, true);
      } else {
        traverseTree(child, indent, false);
      }
    }
    indent--;
  }
  
}

function startTraversal(bookmarkItems) {
  traverseTree(bookmarkItems[0], 0, false);
  restoreOptions()
}

function onRejected(error) {
  var err = document.createElement("p");
  err.innerHTML = `An error occured: ${error}`
  $("bmForm").appendChild(err)
}

let treePromise = browser.bookmarks.getTree();
treePromise.then(startTraversal, onRejected);

// document.addEventListener( 'DOMContentLoaded', restoreOptions );
$("bmForm").addEventListener( 'submit', saveOptions );
