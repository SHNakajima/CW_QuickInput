$(function () {

    window.addEventListener("load", main, false);

    function main(e) {
        const jsInitCheckTimer = setInterval(jsLoaded, 1000);
        function jsLoaded() {
            if ($('_myStatusButton') != null) {
                setButtons();
                clearInterval(jsInitCheckTimer);
            } else {
                console.log('arrrrr');
            }
        };
    };

    /*
     * チャット画面かチェック
     */
    function isChatPage() {
        var ret = false,
            statusBtn = document.getElementById("_myStatusButton");
        if (!!statusBtn) {
            ret = true;
        }
        return ret;
    }


    /*
     * 設定したボタン設定呼び出し
     */
    async function getSettings() {
        let p = new Promise(function (resolve, reject) {
            chrome.storage.sync.get('settings', function (items) {
                resolve(items.settings ? items.settings : []);
            })
        });
        const configOut = await p;
        return configOut;
    };

    /*
     * ツールバーのボタン生成
     * {
     *     "id": [id],
     *     "label": [マウスオーバー時のコメント],
     *     "iconCls": [アイコンのクラス]
     * }
     */
    function getButtonEl(args) {

        // {{{ 初期化
        var el, innerEl;

        // }}}
        // {{{ ボタン生成
        el = document.createElement("li");
        el.setAttribute("role", "button");
        el.className = "_showDescription chatInput__emoticon";
        el.style.display = "inline-block";

        // ボタンによって変える部分
        el.id = args.id;
        el.setAttribute("aria-label", args.label);

        // }}}
        // {{{ ボタンの中身を生成
        innerEl = document.createElement("span");
        innerEl.className = args.iconCls;
        innerEl.style.color = args.color || undefined;
        innerEl.innerHTML = args.html ? args.html : "";

        // ボタンによって変える部分
        innerEl.className += args.iconNoLg ? "" : " icoSizeMiddle";
        innerEl.style = "padding-bottom: 8px;";

        // スタイルを調整
        for (var property in args.style) {
            if (args.style.hasOwnProperty(property)) {
                innerEl.style[property] = args.style[property];
            }
        }

        // }}}
        // {{{ 中身を入れて、返す
        el.appendChild(innerEl);
        return el;
    }

    async function setButtons() {

        var infoBtn,
            chatToolbarEl = document.getElementById("_chatSendTool");

        settings = await getSettings();
        console.log(settings);

        // {{{ infoタグ生成のボタン
        infoBtn = getButtonEl({
            id: "_infoText",
            label: "メッセージに[info][/info]を追加します（Ctrl+i）",
            iconCls: "icoFontInfo"
        });

        infoBtn.addEventListener("click", function () {
            actionFn("info", false, false);
        }, false);

        chatToolbarEl.appendChild(infoBtn);

        // 独自のボタン追加
        settings.forEach(setting => {
            infoBtn = getButtonEl({
                label: setting.desc,
                html: setting.html
            });

            infoBtn.addEventListener("click", function() {
                actionFn(setting.text, false, false, true);
            }, false);

            //キーバインドを有効化していた場合
            if (setting.enableShortcut) {
                document.getElementById("_chatText").addEventListener("keydown", function (e) {
                    var code = e.which,
                        keyChar = String.fromCharCode(code).toLowerCase();
                    if (e.ctrlKey) {
                        if (keyChar === setting.keyBind) {
                            actionFn(setting.text, false, false, true);
                        }
                    }
                }, false);
            }

            chatToolbarEl.appendChild(infoBtn);
        });

        // }}}
        // {{{ キーボードショートカット
        document.getElementById("_chatText").addEventListener("keydown", function (e) {
            var code = e.which,
                keyChar = String.fromCharCode(code).toLowerCase();
            if (e.ctrlKey) {
                if (keyChar === "i") {
                    // info追加
                    actionFn("info", false, false);
                } else if (keyChar === "t") {
                    // titleつきでinfo追加
                    actionFn("info", true, false);
                } else if (keyChar === "w") {
                    // code追加
                    actionFn("code", false, false);
                } else if (keyChar === "l") {
                    // hr追加
                    actionFn("hr", false, true);
                }
            }
        }, false);

    }

    function actionFn(action, bTitle, bNoEnd, onlyInsert) {
        var el,
            startTag = "[" + action + "]",
            endTag = bNoEnd ? "" : "[/" + action + "]",
            startTtlTag = "[title]",
            endTtlTag = "[/title]",
            ttlText,
            oldText,
            selectText = "",
            startPoint,
            endPoint,
            newPoint;

        if (bTitle) {
            // タイトルつきの場合
            ttlText = prompt("タイトルを入力", "");
            if (!ttlText) {
                return false;
            }
            startTag += startTtlTag;
            startTag += ttlText;
            startTag += endTtlTag;
        }

        // テキストエリア取得
        el = document.getElementById("_chatText"),

            // 元のテキスト
            oldText = el.value;

        // カーソル位置
        startPoint = el.selectionStart;
        endPoint = el.selectionEnd;

        // 新しいカーソル位置
        newPoint = startPoint + startTag.length;

        if (startPoint != endPoint) {
            // 選択中の文字取得
            selectText = oldText.substr(startPoint, endPoint - startPoint);

            newPoint = endPoint + startTag.length + endTag.length;
        }

        if(onlyInsert) {
            el.value = oldText.substr(0, startPoint) + action + oldText.substr(endPoint);
        } else {
            // テキストをカーソル位置に入れる
            el.value = oldText.substr(0, startPoint) + startTag + selectText + endTag + oldText.substr(endPoint);   
        }

        // カーソル位置の移動
        el.setSelectionRange(newPoint, newPoint);

        // フォーカスを当ててそのまま送信できるように
        el.focus();
    };
});