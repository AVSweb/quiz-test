const animateIn = "fadeInUp",
    animateOut = "fadeOutUp",
    animationWait = 200;

function animateCSS(element, animationName, delay, callback) {
    const node = element;
    node.classList.add('animated', animationName, delay);

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName, delay);
        node.removeEventListener('animationend', handleAnimationEnd);

        if (typeof callback === 'function') callback();

    }

    node.addEventListener('animationend', handleAnimationEnd);
}

let block = document.querySelector(".block");
let questionNumberBox = document.querySelector(".question__number");
let currentQuestion = document.querySelector(".question__number-current");
let countQuestions = document.querySelector(".question__number-all");
let progressBar = document.querySelector(".question__number-progress");
let answerBox = document.querySelector(".answer-box");
let btnSection = document.querySelector(".btn-section");
let inputBox = document.querySelector(".input-box");
let submitInputBox = document.querySelector(".submit-input");
let ask = document.querySelector(".ask");
let answer = document.querySelectorAll(".answer");
let inputText = document.querySelector(".response_input");
let backBtn = document.querySelector(".back-btn");
let imgFormData = new FormData();
let nullCounter = 0;
let state = [];

let textAnimationStart = (temp = null) => {
    let delay;
    (temp === null) ? delay = 0 : delay = temp;
    animateCSS(ask, animateIn, `${delay === 0 ? "faster" : "delay-1s"}`, appender(ask));
    animateCSS(answerBox, animateIn, `${delay === 0 ? "fast" : "delay-15s"}`, appender(answerBox));
    if (state.length > 1) {
        animateCSS(btnSection, animateIn, `${delay === 0 ? "fast" : "delay-2s"}`, appender(btnSection));
        backBtn.style.display = "";
    } else {
        backBtn.style.display = "none";
    }
    answerBox.style.maxHeight = "100%";
    answerBox.style.padding = "50px 0 0";
    submitInputBox.style.display = "none";
};

let inputAnimationStart = (question, submitBtnShow = true) => {
    let type = question.type_input;
    inputBox.querySelector(".response_input").remove();
    if (inputBox.querySelector(".file-label") !== null) inputBox.querySelector(".file-label").remove();
    if (inputBox.querySelector(".preview") !== null) inputBox.querySelector(".preview").remove();
    let newInput;
    switch (type) {
        case 'textarea':
            newInput = document.createElement("textarea");
            newInput.setAttribute("rows", "4");
            newInput.classList.add("response_input");
            newInput.setAttribute("required", "");
            break;
        case 'date':
            newInput = document.createElement("select");
            for (let i = 0; i < 20; i++) {
                let newOpt = document.createElement("option");
                newOpt.setAttribute("value", 2000 + i);
                newOpt.innerHTML = newOpt.getAttribute("value");
                newInput.appendChild(newOpt);
            }
            newInput.classList.add("response_input");
            newInput.setAttribute("required", "");
            break;
        case 'file':
            let preview = document.createElement("div");
            newInput = document.createElement("label");
            preview.classList.add("preview");
            inputBox.appendChild(preview);
            let newLabel = document.createElement("label");
            newLabel.classList.add("file-label");
            newLabel.innerHTML = `<img src="./img/gallery.svg" alt="gallery">Прикрепите фото`;
            newLabel.setAttribute("for", "fileinput");
            let newInputFile = document.createElement("input");
            newInputFile.setAttribute("type", "file");
            newInputFile.setAttribute("id", "fileinput");
            newInputFile.setAttribute("multiple", "");
            newInputFile.setAttribute("accept", "image/*,image/jpeg");
            newInputFile.classList.add("response_input");
            newInputFile.addEventListener("change", showPreview);
            newLabel.appendChild(newInputFile);
            newInput.appendChild(preview);
            newInput.appendChild(newLabel);
            break;
        default:
            newInput = document.createElement("input");
            newInput.setAttribute("type", "text");
            newInput.classList.add("response_input");
            newInput.setAttribute("required", "");
    }
    if (type !== ("file" && "date")) {
        newInput.addEventListener('keydown', function (e) {
            const {keyCode} = e;
            if (keyCode === 13) {
                submitInputBoxListener();
            }
        });
        if (question.userAnswer) {
            newInput.value = question.userAnswer;
        }
    }
    inputBox.appendChild(newInput);
    if (type !== ("file" && "date")) newInput.focus();
    animateCSS(ask, animateIn, "faster", appender(ask));
    animateCSS(inputBox, animateIn, "fast", appender(inputBox));
    if (state.length > 1) {
        animateCSS(btnSection, animateIn, "fast", appender(btnSection));
        backBtn.style.display = "";
    } else {
        backBtn.style.display = "none";
    }

    if (submitBtnShow) {
        submitInputBox.style.display = "";
    } else {
        submitInputBox.style.display = "none";
    }

    inputBox.style.maxHeight = "100%";
    inputBox.style.padding = "50px 0 0";
};

let textAnimationOut = () => {
    animateCSS(ask, animateOut, "faster", remover(ask));
    animateCSS(answerBox, animateOut, "fast", remover(answerBox));
    animateCSS(btnSection, animateOut, "fast", remover(btnSection));
};

let inputAnimationOut = () => {
    animateCSS(ask, animateOut, "faster", remover(ask));
    animateCSS(inputBox, animateOut, "fast", remover(inputBox));
    animateCSS(btnSection, animateOut, "fast", remover(btnSection));
};

// wait preview question

setTimeout(()=>{
    animateCSS(ask, animateOut, "fast", remover(ask));
    animateCSS(document.querySelector("#loader"), animateOut, "fast", remover(document.querySelector("#loader")));
    //document.querySelector("#loader").remove();
    ask.classList.remove("delay-1s");
    setTimeout(()=>{
        getQuestion();
        animateCSS(questionNumberBox, animateIn, "faster", appender(questionNumberBox));
        //textAnimationStart(1);
    },animationWait);
},10000);

//

function remover(elem) {
    setTimeout(() => {
        elem.style.opacity = 0;
        elem.maxHeight = 0;
    }, 100);
    inputBox.style.padding = "0";
    inputBox.style.maxHeight = "0";
    answerBox.style.maxHeight = "0";
    answerBox.style.padding = "0";
}

function appender(elem) {
    elem.style.opacity = 1;
    elem.style.maxHeight = "100%";
    setTimeout(() => {
        backBtn.addEventListener("click", backBtnListener);
    }, animationWait);
}

inputBox.addEventListener('keydown', function(event) {
    if(event.keyCode == 13) {
        event.preventDefault();
    }
});

answer.forEach((el) => {
    el.addEventListener("click", (e) => {
        //statistic
        ga('send', 'event', 'prodat_avto', 'choice');
        yaCounter29257985.reachGoal ('choice');
        //
        answerEventClick(e, el.innerHTML);
    });
});

submitInputBox.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo(0, 0);
    submitInputBoxListener();
});
backBtn.addEventListener("click", backBtnListener);

async function getQuestion(answer = null, type = null, isFile = false, userAnswer = null) {
    if (isFile === true) {
        let xhttpFile = new XMLHttpRequest();
        xhttpFile.open("POST", "/api/quest", true);
        // xhttpFile.timeout = 100;
        let fileData = answer;//new FormData();
        // for(let i =0;i<answer.length; i++){
        //     formData.append("answer[]", answer[i]);
        // }
        //  formData.append("answer[]", answer);
        fileData.append("isFile", isFile);
        fileData.append("type", type);
        fileData.append("nullQuestion", nullCounter);
        fileData.append("ask", state[state.length - 1].ask);

        await xhttpFile.send(fileData);

        xhttpFile.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let question = JSON.parse(xhttpFile.responseText);
                showRequestAnswer(question, userAnswer);
            }
        };
    } else {
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/api/quest", true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        let input = {};
        if (type === "input" || type === null) {
            input = JSON.stringify({
                "nullQuestion": nullCounter,
                "answer": answer,
                "type": type,
                "isFile": isFile,
                "ask": (state.length) ? state[state.length - 1].ask : null
            });
        } else {
            input = JSON.stringify({
                "type": type,
                "answer": answer,
                "nullQuestion": nullCounter,
                "isFile": isFile,
                "ask": (state.length) ? state[state.length - 1].ask : null
            });
        }
        await xhttp.send(input);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let question = JSON.parse(xhttp.responseText);
                showRequestAnswer(question, userAnswer);
            }
        };
    }
}

function backBtnListener() {
    //statistic
    yaCounter29257985.reachGoal ('back');
    ga('send', 'event', 'prodat_avto', 'back');
    //

    if (+currentQuestion.innerHTML !== 1) {
        currentQuestion.innerHTML = +currentQuestion.innerHTML - 1;
        progressBar.style.width = `${+currentQuestion.innerHTML * 30}px`;
    }
    if (btnSection.querySelector(".send-btn")) {
        btnSection.querySelector(".send-btn").remove();
    }
    window.scrollTo(0, 0);
    if (state.length > 1) {
        if (state[state.length - 1].type === "input") {
            inputAnimationOut();
            remover(answerBox);
            nullCounter--;
        } else {
            textAnimationOut();
        }
        answerBox.style.maxHeight = "0";
        inputBox.style.maxHeight = "0";
        state.pop();
        let prevQuestion = state[state.length - 1];
        if (prevQuestion.type === "text") {
            setTimeout(() => {
                ask.innerHTML = prevQuestion.ask.split("\n").join(`<br>`);
                prevQuestion.answer.forEach(function (el, index) {
                    answerBox.querySelectorAll(".answer")[index].innerHTML = el;
                });
                setTimeout(textAnimationStart, 200);
            }, animationWait);
        } else {
            setTimeout(() => {
                ask.innerHTML = prevQuestion.ask.split("\n").join(`<br>`);
                setTimeout(() => {
                    inputAnimationStart(prevQuestion);
                }, 200);
            }, animationWait);
        }
    }
    backBtn.removeEventListener("click", backBtnListener);
}

function answerEventClick(e, content) {
    if (+currentQuestion.innerHTML + 1 <= +countQuestions.innerHTML) {
        currentQuestion.innerHTML = +currentQuestion.innerHTML + 1;
        progressBar.style.width = `${+currentQuestion.innerHTML * 30}px`;
    }
    textAnimationOut();
    setTimeout(() => {
        getQuestion(content, "text");
    }, animationWait);

    e.target.removeEventListener("click", answerEventClick);
}

function submitInputBoxListener() {
    //statistic
    ga('send', 'event', 'prodat_avto', 'next');
    yaCounter29257985.reachGoal ('next');
    //

    inputText = document.querySelector(".response_input");
    if (!validate(inputText)) {
        return;
    }
    if (+currentQuestion.innerHTML + 1 <= +countQuestions.innerHTML) {
        currentQuestion.innerHTML = +currentQuestion.innerHTML + 1;
        progressBar.style.width = `${+currentQuestion.innerHTML * 30}px`;
    }
    inputAnimationOut();
    inputText = document.querySelector(".response_input");
    let userAnswer = "";
    let isFile = false;
    let inputVal = inputText.value;
    if (inputText.hasAttribute("type") && inputText.getAttribute("type") === "file") {
        isFile = true;

        if (imgFormData.get("answer[]")) {
            inputVal = imgFormData;
        } else {
            inputVal = new FormData();
        }
    }
    if (inputText.hasAttribute("type") && inputText.getAttribute("type") === "text" || inputText.tagName.toLowerCase() === "textarea") {
        userAnswer = inputText.value;
    }


    setTimeout(() => {
        getQuestion(inputVal, "input", isFile, userAnswer);
    }, animationWait);

    submitInputBox.removeEventListener("click", submitInputBoxListener);
}

function showRequestAnswer(question, userAnswer = null) {
    (question.nullQuestion === 0) ? nullCounter = 1 : question.nullQuestion === null ? nullCounter : nullCounter = question.nullQuestion;
    ask.innerHTML = question.ask.split("\n").join(`<br>`);
    state.push(question);
    if (userAnswer) {
        state[state.length - 2].userAnswer = userAnswer;
    }
    if (question.type === "text") {
        if (question.ask == "LAST_RESPONSE") {
            document.querySelector(".content").style.maxHeight = "0";
            let lastShow = document.querySelector(".last__show");
            lastShow.style.display = "block";
            animateCSS(lastShow, animateIn, "faster", appender(lastShow));
        } else if (question.answer) {
            question.answer.forEach(function (el, index) {
                document.querySelectorAll(".answer")[index].innerHTML = el;
            });
            setTimeout(textAnimationStart, 200);
        } else {
            setTimeout(() => {
                animateCSS(ask, animateIn, "faster", appender(ask));
                animateCSS(btnSection, animateIn, "fast", appender(btnSection));
                submitInputBox.style.display = "none";
            }, animationWait);
        }
    } else {
        let showSubmitBtn = true;
        if (+currentQuestion.innerHTML === +countQuestions.innerHTML) {
            let lastButton = document.createElement("button");
            lastButton.classList.add("btn", "btn-custom", "btn-success", "send-btn");
            lastButton.innerHTML = "Отправить";
            lastButton.addEventListener("click",sendUsersAnswers);
            btnSection.insertBefore(lastButton, submitInputBox);
            showSubmitBtn = false;
        } else {
            if (btnSection.querySelector(".send-btn")) {
                btnSection.querySelector(".send-btn").remove();
            }
        }
        setTimeout(() => {
            inputAnimationStart(question, showSubmitBtn);
        }, 200);
    }
}

let sendUsersAnswers = ()=>{

    //statistic
    yaCounter29257985.reachGoal ('success');
    ga('send', 'event', 'prodat_avto', 'success');
    //

    inputText = document.querySelector(".response_input");
    if (!validate(inputText)) {
        return;
    }
    if (+currentQuestion.innerHTML + 1 <= +countQuestions.innerHTML) {
        currentQuestion.innerHTML = +currentQuestion.innerHTML + 1;
        progressBar.style.width = `${+currentQuestion.innerHTML * 30}px`;
    }
    inputAnimationOut();
    inputText = document.querySelector(".response_input");
    let userAnswer = "";
    let isFile = false;
    let inputVal = inputText.value;
    if (inputText.hasAttribute("type") && inputText.getAttribute("type") === "file") {
        isFile = true;

        if (imgFormData.get("answer[]")) {
            inputVal = imgFormData;
        } else {
            inputVal = new FormData();
        }
    }
    if (inputText.hasAttribute("type") && inputText.getAttribute("type") === "text" || inputText.tagName.toLowerCase() === "textarea") {
        userAnswer = inputText.value;
    }


    setTimeout(() => {
        getQuestion(inputVal, "input", isFile, userAnswer);
    }, animationWait);

    document.querySelector(".send-btn").removeEventListener("click", sendUsersAnswers);
};

function validate(el) {
    if (el.hasAttribute("type") && el.getAttribute("type") === "file") {
        return true;
    }
    if (el.value === "") {
        document.querySelector(".error-msg").innerHTML = "Поле не может быть пустым!";
        return false;
    } else {
        document.querySelector(".error-msg").innerHTML = "";
        return true;
    }
}

function showPreview() {

    let preview = document.querySelector('.preview');

    if (this.files) {
        [].forEach.call(this.files, readAndPreview);
    }

    function readAndPreview(file) {

        // Make sure `file.name` matches our extensions criteria
        if (!/\.(jpe?g|png|gif)$/i.test(file.name)) {
            return alert(file.name + " is not an image");
        } // else...
        var reader = new FileReader();

        reader.addEventListener("load", function () {
            let imgWrapper = document.createElement("div");
            imgWrapper.classList.add("preview__wrapper");
            let image = document.createElement("img");
            image.title = file.name;
            image.src = this.result;
            image.classList.add("preview__img");
            imgWrapper.appendChild(image);
            preview.appendChild(imgWrapper);
        });
        imgFormData.append("answer[]", file);
        reader.readAsDataURL(file);

    }
}