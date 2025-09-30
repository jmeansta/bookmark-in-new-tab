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

async function clearOptions(event) {
  event.preventDefault();
  if (window.confirm("Are you sure you want to clear all saved bookmarks?")) {
    var options = {};
    options.selectedBmNodes = [];
    await browser.storage.local.set( options );
    location.reload()
  }
}

const restoreOptions = async _ => {
  function highlight(famIdentifier) {
    if (/bmid_[\w-]{12}/g.test(famIdentifier)) {
      // alert(famIdentifier.replace("bmid","parent"))
      $(famIdentifier.replace("bmid","parent")).classList.add("checkedChild")
    }
  }

  function restoreCheckmarks(id) {
    $(id).checked = true
    // alert($(id).parentElement.classList)
    $(id).parentElement.classList.forEach((famIdentifier) => highlight(famIdentifier))
  }

  const options = await browser.storage.local.get();
  options.selectedBmNodes.forEach((id) => restoreCheckmarks(id));
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

function newElement(bookmarkItem,indent,classList,bmid) {
  
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
    div.id = `parent_${bookmarkItem.id}`
    //button
    // button.innerHTML = "  toggle  "
    button.src = "icons/arrow-left.svg";
    button.dataset.collapsed = true;
    button.title = button.dataset.collapsed
    button.dataset.bmid = bmid;
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
  div.classList.add("treeItem")
  classList.forEach((c) => div.classList.add(c))

  div.title = `id: ${div.id}; classList: ${div.classList}`
  $("bmForm").appendChild(div)
}

function traverseTree(bookmarkItem, indent, printingChildren, classList) {
  var bmid = `bmid_${bookmarkItem.id}`

  if (printingChildren) {
    newElement(bookmarkItem,indent,classList,bmid)
  }

  if (bookmarkItem.children) {
    if (bookmarkItem.id != "root________") {
      indent++;

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
$("bmForm").addEventListener('submit',saveOptions);
$("clearButton").addEventListener('click',clearOptions);
