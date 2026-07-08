(function () {
  "use strict";

  var termEl = document.getElementById("terminal");
  var outEl = document.getElementById("term-output");
  var inputEl = document.getElementById("term-input");
  var promptEl = document.getElementById("term-prompt");
  var formEl = document.getElementById("term-form");
  if (!termEl || !outEl || !inputEl || !promptEl || !formEl) return;

  // ---- Load injected site/post data ----
  var data = { site: {}, posts: [] };
  try {
    var raw = document.getElementById("fs-data");
    if (raw) data = JSON.parse(raw.textContent);
  } catch (e) {
    data = { site: {}, posts: [] };
  }

  var USER = termEl.getAttribute("data-user") || "visitor";
  var HOST = termEl.getAttribute("data-host") || "cyen07";

  // ---- Build a tiny virtual filesystem ----
  // root "~" -> posts/ (one file per post), about.txt, tags/
  var root = { type: "dir", children: {} };

  function addNode(dir, name, node) {
    dir.children[name] = node;
    node.name = name;
  }

  var postsDir = { type: "dir", children: {} };
  addNode(root, "posts", postsDir);

  data.posts.forEach(function (p) {
    var fname = (p.slug || "yazi") + ".md";
    addNode(postsDir, fname, { type: "post", post: p });
  });

  // about.txt
  var aboutText =
    (data.site.author ? data.site.author : "CyEn07") +
    (data.site.nick ? " (" + data.site.nick + ")" : "") +
    "\n\n" +
    (data.site.description || "") +
    "\n\nDaha fazlası icin: cat about.txt calistir ya da 'open about' yaz.";
  addNode(root, "about.txt", { type: "text", content: aboutText, link: "/about/" });

  // tags/ dir (one file per tag)
  var tagMap = {};
  data.posts.forEach(function (p) {
    (p.tags || []).forEach(function (t) {
      if (!tagMap[t]) tagMap[t] = [];
      tagMap[t].push(p);
    });
  });
  var tagsDir = { type: "dir", children: {} };
  addNode(root, "tags", tagsDir);
  Object.keys(tagMap).sort().forEach(function (t) {
    addNode(tagsDir, t, { type: "tag", tag: t, posts: tagMap[t] });
  });

  // ---- State ----
  var cwd = ["~"]; // path segments, first is always ~
  var history = [];
  var histIndex = -1;

  function currentDir() {
    var node = root;
    for (var i = 1; i < cwd.length; i++) {
      node = node.children[cwd[i]];
    }
    return node;
  }

  function cwdString() {
    return cwd.join("/").replace("~/", "~/");
  }

  function updatePrompt() {
    promptEl.textContent = USER + "@" + HOST + ":" + cwdString() + "$";
  }

  // ---- Output helpers ----
  function scrollDown() {
    outEl.scrollTop = outEl.scrollHeight;
    termEl.scrollTop = termEl.scrollHeight;
  }

  function printNode(node) {
    outEl.appendChild(node);
    scrollDown();
  }

  function printText(text, cls) {
    var div = document.createElement("div");
    div.className = "term-row" + (cls ? " " + cls : "");
    div.textContent = text;
    printNode(div);
  }

  function printHTML(builderFn, cls) {
    var div = document.createElement("div");
    div.className = "term-row" + (cls ? " " + cls : "");
    builderFn(div);
    printNode(div);
  }

  function echoCommand(cmdText) {
    var div = document.createElement("div");
    div.className = "term-row term-echo";
    var pr = document.createElement("span");
    pr.className = "term-prompt";
    pr.textContent = promptEl.textContent + " ";
    var cmd = document.createElement("span");
    cmd.textContent = cmdText;
    div.appendChild(pr);
    div.appendChild(cmd);
    printNode(div);
  }

  function link(text, href) {
    var a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    return a;
  }

  // ---- Commands ----
  var COMMANDS = {
    help: function () {
      printText("Kullanilabilir komutlar:", "term-title");
      var rows = [
        ["help", "bu yardim ekranini gosterir"],
        ["ls [dizin]", "dizindeki dosya/klasorleri listeler"],
        ["cd <dizin>", "dizin degistirir (cd .. ust dizin, cd ~ ana dizin)"],
        ["pwd", "bulundugun dizini yazar"],
        ["cat <dosya>", "dosyanin/yazinin ozetini gosterir"],
        ["open <dosya>", "yaziyi/sayfayi acar (yeni sayfaya gider)"],
        ["tags", "tum etiketleri listeler"],
        ["tree", "site yapisini agac olarak gosterir"],
        ["whoami", "hakkinda bilgisi"],
        ["social", "sosyal medya baglantilari"],
        ["theme", "koyu/acik tema arasinda gecis yapar"],
        ["banner", "acilis banner'ini tekrar gosterir"],
        ["admin", "yonetim paneli (yazi/hakkinda duzenleme)"],
        ["date", "tarih ve saati yazar"],
        ["echo <metin>", "metni ekrana yazar"],
        ["clear", "ekrani temizler"]
      ];
      rows.forEach(function (r) {
        printHTML(function (div) {
          var c = document.createElement("span");
          c.className = "term-cmd-name";
          c.textContent = r[0];
          div.appendChild(c);
          div.appendChild(document.createTextNode("  " + r[1]));
        });
      });
    },

    ls: function (args) {
      var target = currentDir();
      var label = null;
      if (args[0]) {
        var resolved = resolvePath(args[0]);
        if (!resolved || resolved.node.type !== "dir") {
          // maybe it's a file -> ls of a file just prints it
          if (resolved && resolved.node) {
            printText(args[0]);
            return;
          }
          printText("ls: '" + args[0] + "': boyle bir dizin yok", "term-err");
          return;
        }
        target = resolved.node;
        label = args[0];
      }
      var names = Object.keys(target.children);
      if (names.length === 0) {
        printText("(bos dizin)", "term-muted");
        return;
      }
      printHTML(function (div) {
        names.forEach(function (n, i) {
          var node = target.children[n];
          var span = document.createElement("span");
          span.className =
            "term-ls-item " +
            (node.type === "dir" ? "term-dir" : node.type === "post" || node.type === "tag" ? "term-file-post" : "term-file");
          span.textContent = node.type === "dir" ? n + "/" : n;
          div.appendChild(span);
          if (i < names.length - 1) div.appendChild(document.createTextNode("   "));
        });
      });
    },

    cd: function (args) {
      var arg = args[0];
      if (!arg || arg === "~" || arg === "/") {
        cwd = ["~"];
        updatePrompt();
        return;
      }
      if (arg === "..") {
        if (cwd.length > 1) cwd.pop();
        updatePrompt();
        return;
      }
      if (arg === ".") return;
      var resolved = resolvePath(arg);
      if (!resolved) {
        printText("cd: '" + arg + "': boyle bir dizin yok", "term-err");
        return;
      }
      if (resolved.node.type !== "dir") {
        printText("cd: '" + arg + "': bir dizin degil", "term-err");
        return;
      }
      cwd = resolved.path;
      updatePrompt();
    },

    pwd: function () {
      printText(cwdString());
    },

    cat: function (args) {
      var arg = args[0];
      if (!arg) {
        printText("kullanim: cat <dosya>", "term-muted");
        return;
      }
      var resolved = resolvePath(arg);
      if (!resolved || resolved.node.type === "dir") {
        printText("cat: '" + arg + "': boyle bir dosya yok", "term-err");
        return;
      }
      var node = resolved.node;
      if (node.type === "post") {
        var p = node.post;
        printText(p.title, "term-title");
        printText(p.date + "   " + (p.tags || []).map(function (t) { return "#" + t; }).join(" "), "term-muted");
        printText("");
        printText(p.excerpt || "");
        printText("");
        printHTML(function (div) {
          div.appendChild(document.createTextNode("Yazinin tamami -> "));
          div.appendChild(link(p.url, p.url));
          div.appendChild(document.createTextNode("   (open " + node.name + ")"));
        });
      } else if (node.type === "tag") {
        COMMANDS._showTag(node.tag);
      } else if (node.type === "text") {
        node.content.split("\n").forEach(function (l) { printText(l); });
        if (node.link) {
          printHTML(function (div) {
            div.appendChild(document.createTextNode("-> "));
            div.appendChild(link(node.link, node.link));
          });
        }
      }
    },

    open: function (args) {
      var arg = args[0];
      if (!arg) {
        printText("kullanim: open <dosya|about|posts|tags>", "term-muted");
        return;
      }
      if (arg === "about") { go("/about/"); return; }
      if (arg === "posts") { go("/posts/"); return; }
      if (arg === "tags") { go("/tags/"); return; }
      if (arg === "archives" || arg === "arsiv") { go("/archives/"); return; }
      var resolved = resolvePath(arg);
      if (!resolved) {
        printText("open: '" + arg + "': bulunamadi", "term-err");
        return;
      }
      var node = resolved.node;
      if (node.type === "post") { go(node.post.url); return; }
      if (node.type === "text" && node.link) { go(node.link); return; }
      if (node.type === "tag") { go("/tags/#" + node.tag); return; }
      printText("open: '" + arg + "' acilamaz", "term-err");
    },

    tags: function () {
      var names = Object.keys(tagsDir.children).sort();
      if (names.length === 0) { printText("(etiket yok)", "term-muted"); return; }
      printText("Etiketler:", "term-title");
      printHTML(function (div) {
        names.forEach(function (t, i) {
          var count = tagsDir.children[t].posts.length;
          var span = document.createElement("span");
          span.className = "term-file-post";
          span.textContent = "#" + t + "(" + count + ")";
          div.appendChild(span);
          if (i < names.length - 1) div.appendChild(document.createTextNode("   "));
        });
      });
      printText("Detay icin: cat tags/<etiket>", "term-muted");
    },

    _showTag: function (tag) {
      var node = tagsDir.children[tag];
      if (!node) { printText("boyle bir etiket yok", "term-err"); return; }
      printText("#" + tag + " (" + node.posts.length + " yazi)", "term-title");
      node.posts.forEach(function (p) {
        printHTML(function (div) {
          div.appendChild(document.createTextNode(p.date + "  "));
          div.appendChild(link(p.title, p.url));
        });
      });
    },

    tree: function () {
      printText("~");
      var topKeys = Object.keys(root.children);
      topKeys.forEach(function (k, i) {
        var isLastTop = i === topKeys.length - 1;
        var node = root.children[k];
        printText((isLastTop ? "└── " : "├── ") + (node.type === "dir" ? k + "/" : k));
        if (node.type === "dir") {
          var childKeys = Object.keys(node.children);
          childKeys.forEach(function (ck, j) {
            var isLastChild = j === childKeys.length - 1;
            var prefix = isLastTop ? "    " : "│   ";
            printText(prefix + (isLastChild ? "└── " : "├── ") + ck);
          });
        }
      });
    },

    whoami: function () {
      printText(data.site.author || "CyEn07", "term-title");
      if (data.site.nick) printText("nick: " + data.site.nick, "term-muted");
      printText("");
      printText(data.site.description || "");
      printHTML(function (div) {
        div.appendChild(document.createTextNode("Hakkinda sayfasi -> "));
        div.appendChild(link("/about/", "/about/"));
      });
    },

    social: function () {
      var gh = data.site.github;
      if (!gh) { printText("(sosyal medya baglantisi tanimli degil)", "term-muted"); return; }
      printText("Sosyal:", "term-title");
      printHTML(function (div) {
        div.appendChild(document.createTextNode("github  -> "));
        div.appendChild(link("github.com/" + gh, "https://github.com/" + gh));
      });
    },

    theme: function () {
      var r = document.documentElement;
      var current = r.getAttribute("data-theme") === "dark" ? "light" : "dark";
      r.setAttribute("data-theme", current);
      try { localStorage.setItem("theme", current); } catch (e) {}
      printText("tema: " + (current === "dark" ? "koyu" : "acik"), "term-muted");
    },

    date: function () {
      printText(new Date().toString());
    },

    echo: function (args) {
      printText(args.join(" "));
    },

    banner: function () {
      showBanner();
    },

    admin: function () {
      go("/admin/");
    },

    clear: function () {
      outEl.innerHTML = "";
    },

    sudo: function () {
      printText("sudo: yetkin yok. Sen sadece bir ziyaretcisin :)", "term-muted");
    }
  };

  // ---- Path resolution ----
  // supports: name, dir/name, ~, .., ~/dir, /dir
  function resolvePath(pathStr) {
    var parts = pathStr.split("/").filter(function (s) { return s.length > 0 && s !== "."; });
    var stack, startNode;

    if (pathStr.charAt(0) === "/" || pathStr.charAt(0) === "~") {
      stack = ["~"];
      startNode = root;
      if (parts[0] === "~") parts.shift();
    } else {
      stack = cwd.slice();
      startNode = currentDir();
    }

    var node = startNode;
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (part === "..") {
        if (stack.length > 1) { stack.pop(); }
        node = nodeAt(stack);
        continue;
      }
      if (node.type !== "dir" || !node.children[part]) return null;
      node = node.children[part];
      stack.push(part);
    }
    return { node: node, path: stack };
  }

  function nodeAt(stack) {
    var node = root;
    for (var i = 1; i < stack.length; i++) node = node.children[stack[i]];
    return node;
  }

  function go(url) {
    printText("aciliyor: " + url, "term-muted");
    setTimeout(function () { window.location.href = url; }, 120);
  }

  // ---- Banner ----
  function showBanner() {
    var art = [
      "  ____      _____       ___ _____ ",
      " / ___|   _| ____|_ __ / _ \\___  |",
      "| |  | | | |  _| | '_ \\ | | | / / ",
      "| |__| |_| | |___| | | | |_| |/ /  ",
      " \\____\\__, |_____|_| |_|\\___//_/   ",
      "      |___/                        "
    ];
    var pre = document.createElement("pre");
    pre.className = "term-banner";
    pre.textContent = art.join("\n");
    printNode(pre);
    printText(data.site.description || "Siber guvenlik & IHA/SIHA sistemleri", "term-muted");
    printHTML(function (div) {
      div.appendChild(document.createTextNode("Baslamak icin "));
      var c = document.createElement("span");
      c.className = "term-cmd-name";
      c.textContent = "help";
      div.appendChild(c);
      div.appendChild(document.createTextNode(" yaz. Yazilar icin "));
      var c2 = document.createElement("span");
      c2.className = "term-cmd-name";
      c2.textContent = "ls posts";
      div.appendChild(c2);
      div.appendChild(document.createTextNode(", yonetim icin "));
      var c3 = document.createElement("span");
      c3.className = "term-cmd-name";
      c3.textContent = "admin";
      div.appendChild(c3);
      div.appendChild(document.createTextNode(" dene."));
    });
    printText("");
  }

  // ---- Command runner ----
  function run(line) {
    var trimmed = line.trim();
    echoCommand(line);
    if (trimmed === "") return;
    history.push(trimmed);
    histIndex = history.length;

    var parts = trimmed.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var args = parts.slice(1);

    if (cmd.charAt(0) === "_") {
      printText(cmd + ": komut bulunamadi. 'help' yaz.", "term-err");
      return;
    }
    if (COMMANDS[cmd]) {
      COMMANDS[cmd](args);
    } else {
      printText(cmd + ": komut bulunamadi. 'help' yazarak komut listesini gor.", "term-err");
    }
  }

  // ---- Tab completion ----
  function complete() {
    var val = inputEl.value;
    var parts = val.split(/\s+/);
    if (parts.length === 1) {
      // complete command name
      var prefix = parts[0].toLowerCase();
      var matches = Object.keys(COMMANDS).filter(function (c) {
        return c.charAt(0) !== "_" && c.indexOf(prefix) === 0;
      });
      if (matches.length === 1) inputEl.value = matches[0] + " ";
      else if (matches.length > 1) printText(matches.join("   "), "term-muted");
    } else {
      // complete file/dir in cwd (or dir portion of arg)
      var arg = parts[parts.length - 1];
      var dirPart = "";
      var namePart = arg;
      var slash = arg.lastIndexOf("/");
      if (slash >= 0) {
        dirPart = arg.slice(0, slash + 1);
        namePart = arg.slice(slash + 1);
      }
      var baseDir = currentDir();
      if (dirPart) {
        var resolved = resolvePath(dirPart);
        if (resolved && resolved.node.type === "dir") baseDir = resolved.node;
        else return;
      }
      var names = Object.keys(baseDir.children).filter(function (n) {
        return n.indexOf(namePart) === 0;
      });
      if (names.length === 1) {
        var node = baseDir.children[names[0]];
        parts[parts.length - 1] = dirPart + names[0] + (node.type === "dir" ? "/" : "");
        inputEl.value = parts.join(" ");
      } else if (names.length > 1) {
        printText(names.join("   "), "term-muted");
      }
    }
  }

  // ---- Events ----
  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    var line = inputEl.value;
    inputEl.value = "";
    run(line);
    scrollDown();
  });

  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      histIndex = Math.max(0, histIndex - 1);
      inputEl.value = history[histIndex] || "";
      moveCaretEnd();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      histIndex = Math.min(history.length, histIndex + 1);
      inputEl.value = history[histIndex] || "";
      moveCaretEnd();
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      COMMANDS.clear();
    }
  });

  function moveCaretEnd() {
    setTimeout(function () {
      inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
    }, 0);
  }

  // Focus input when clicking anywhere in terminal (but not when selecting text)
  termEl.addEventListener("click", function () {
    var sel = window.getSelection();
    if (sel && sel.toString().length > 0) return;
    inputEl.focus();
  });

  // ---- Init ----
  updatePrompt();
  showBanner();
  inputEl.focus();
})();
