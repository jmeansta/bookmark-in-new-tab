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

function toggleVisibility(button) {
  if ($(button.dataset.bmid).disabled == true) {
    $(button.dataset.bmid).disabled = false
    button.src = "icons/arrow-left.svg"
  } else {
    $(button.dataset.bmid).disabled = true
    button.src = "icons/arrow-down.svg"
  }
}

function newElement(bookmarkItem,indent,classList) {
  
  var div = document.createElement("div");
  var input = document.createElement("input");
  var label = document.createElement("label");
  var button = document.createElement("img")

  // checkbox
  input.type = "checkbox";
  input.id = bookmarkItem.id;
  input.classList.add("bmNodeCheckbox");
  div.appendChild(input)

  // label
  label.innerHTML = bookmarkItem.title;
  label.htmlFor = bookmarkItem.id;
  div.appendChild(label)

  // div
  div.style = "margin: 0px; margin-left: " + indent*40 + "px;"
  if (bookmarkItem.url) {
    div.classList.add("bookmark")
    div.title = bookmarkItem.url;
  } else {
    div.classList.add("folder")
    //button
    // button.innerHTML = "  toggle  "
    button.src = "icons/arrow-left.svg";
    button.dataset.collapsed = true;
    button.title = button.dataset.collapsed
    button.dataset.bmid = `bmid${bookmarkItem.id}`;
    button.onclick = function() {toggleVisibility(this)}
    div.appendChild(button)
  }

  // separator/hr overwriting
  if (bookmarkItem.url == "data:") {
    // horizontal rules turn into boxes when they have innerHTML
    // I elected to just overwrite the "div" variable in this case
    var div = document.createElement("hr"); // separators
    div.align = "right";
    div.width = $("bmForm").clientWidth-indent*40 + "px";
  }

  // classes (incl. those for collapsability)
  div.title = div.classList
  div.classList.add("treeItem")
  classList.forEach((c) => div.classList.add(c))
  $("bmForm").appendChild(div)
}

function traverseTree(bookmarkItem, indent, printingChildren,classList) {
  if (printingChildren) {
    newElement(bookmarkItem,indent,classList)
  }

  if (bookmarkItem.children) {
    if (bookmarkItem.id != "root________") {
      indent++;
      var bmid = `bmid${bookmarkItem.id}`

      classList.push(bmid)

      var collapseStyle = document.createElement("style");
      collapseStyle.id = bmid;
      collapseStyle.innerHTML = "." + bmid + " {display: none;}"
      document.body.appendChild(collapseStyle)
      collapseStyle.disabled = false;

    }
    for (const child of bookmarkItem.children) {
      // if (printingChildren || bookmarkItem.id == "toolbar_____") {
      if (printingChildren || bookmarkItem.id == "root________") {
        traverseTree(child, indent, true, classList);
      } else {
        traverseTree(child, indent, false, classList);
      }
    }
    if (bookmarkItem.id != "root________") {
      indent--;
      classList.pop()
    }
  }
  
}

function startTraversal(bookmarkItems) {
  traverseTree(bookmarkItems[0], 0, false,[]);
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
