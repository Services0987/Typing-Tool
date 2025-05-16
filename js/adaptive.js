// js/adaptive.js

// This file assumes charPerformance object is passed to its functions or accessible.
// It also assumes TEXT_SAMPLES is available globally (from texts.js) for fallback words.

const ADAPTIVE_MIN_ATTEMPTS_FOR_CONSIDERATION = 3; // Min times a char must be typed to be considered for adaptive logic
const ADAPTIVE_ACCURACY_THRESHOLD = 0.92; // Chars with accuracy below this (92%) are prioritized
const ADAPTIVE_TARGET_PROBLEM_CHARS = 5; // How many top problem characters to focus on
const ADAPTIVE_PROBLEM_CHAR_WEIGHT = 0.4; // ~40% of adaptive text will try to include problem chars/words

function generateRandomWordsEngine(count, minLength = 3, maxLength = 8, includePunctuation = false, includeNumbers = false, includeSymbols = false) {
    // Using a more extensive word list for better variety
    const wordList = [
        "ability","able","about","above","accept","according","account","across","action","activity",
        "actually","add","address","administration","admit","adult","affect","after","again","against",
        "age","agency","agent","ago","agree","agreement","ahead","air","all","allow","almost","alone",
        "along","already","also","although","always","american","among","amount","analysis","and",
        "animal","another","answer","any","anyone","anything","appear","apply","approach","area",
        "argue","arm","around","arrive","art","article","artist","as","ask","assume","at","attack",
        "attention","attorney","audience","author","authority","available","avoid","away","baby",
        "back","bad","bag","ball","bank","bar","base","be","beat","beautiful","because","become",
        "bed","before","begin","behavior","behind","believe","benefit","best","better","between",
        "beyond","big","bill","billion","bit","black","blood","blue","board","body","book","born",
        "both","box","boy","break","bring","brother","budget","build","building","business","but",
        "buy","by","call","camera","campaign","can","cancer","candidate","capital","car","card",
        "care","career","carry","case","catch","cause","cell","center","central","century","certain",
        "certainly","chair","challenge","chance","change","character","charge","check","child",
        "choice","choose","church","citizen","city","civil","claim","class","clear","clearly",
        "close","coach","cold","collection","college","color","come","commercial","common",
        "community","company","compare","computer","concern","condition","conference","congress",
        "consider","consumer","contain","continue","control","cost","could","country","couple",
        "course","court","cover","create","crime","cultural","culture","cup","current","customer",
        "cut","dark","data","daughter","day","dead","deal","death","debate","decade","decide",
        "decision","deep","defense","degree","democrat","democratic","describe","design","despite",
        "detail","determine","develop","development","die","difference","different","difficult",
        "dinner","direction","director","discover","discuss","discussion","disease","do","doctor",
        "dog","door","down","draw","dream","drive","drop","drug","during","each","early","east",
        "easy","eat","economic","economy","edge","education","effect","effort","eight","either",
        "election","else","employee","end","energy","enjoy","enough","enter","entire","environment",
        "environmental","especially","establish","even","evening","event","ever","every","everybody",
        "everyone","everything","evidence","exactly","example","executive","exist","expect",
        "experience","expert","explain","eye","face","fact","factor","fail","fall","family","far",
        "fast","father","fear","federal","feel","feeling","few","field","fight","figure","fill",
        "film","final","finally","financial","find","fine","finger","finish","fire","firm","first",
        "fish","five","floor","fly","focus","follow","food","foot","for","force","foreign","forget",
        "form","former","forward","four","free","friend","from","front","full","fund","future",
        "game","garden","gas","general","generation","get","girl","give","glass","go","goal","good",
        "government","great","green","ground","group","grow","growth","guess","gun","guy","hair",
        "half","hand","hang","happen","happy","hard","have","he","head","health","hear","heart",
        "heat","heavy","help","her","here","herself","high","him","himself","his","history","hit",
        "hold","home","hope","hospital","hot","hotel","hour","house","how","however","huge","human",
        "hundred","husband","idea","identify","if","image","imagine","impact","important","improve",
        "in","include","including","increase","indeed","indicate","individual","industry",
        "information","inside","instead","institution","interest","interesting","international",
        "interview","into","investment","involve","issue","it","item","its","itself","job","join",
        "joint","joke","judge","jump","just","keep","key","kid","kill","kind","kitchen","know",
        "knowledge","land","language","large","last","late","later","laugh","law","lawyer","lay",
        "lead","leader","learn","least","leave","left","leg","legal","less","let","letter","level",
        "lie","life","light","like","likely","line","list","listen","little","live","local","long",
        "look","lose","loss","lot","love","low","machine","magazine","main","maintain","major",
        "majority","make","man","manage","management","manager","many","market","marriage","material",
        "matter","may","maybe","me","mean","measure","media","medical","meet","meeting","member",
        "memory","mention","message","method","middle","might","military","million","mind","mine",
        "minister","minor","minority","minute","miss","mission","model","modern","moment","money",
        "month","more","morning","most","mother","motion","motor","mouth","move","movement","movie",
        "mr","mrs","much","multiple","music","must","my","myself","name","nation","national",
        "natural","nature","near","nearly","necessary","need","negotiation","neighbor","network",
        "never","new","news","newspaper","next","nice","night","no","none","nor","north","not",
        "note","nothing","notice","now","number","occur","of","off","offer","office","officer",
        "official","often","oh","oil","ok","old","on","once","one","only","onto","open","operation",
        "opportunity","option","or","order","organization","other","others","our","out","outside",
        "over","own","owner","page","pain","painting","paper","parent","part","participant",
        "particular","particularly","partner","party","pass","past","patient","pattern","pay",
        "peace","people","per","perform","performance","perhaps","period","person","personal",
        "phone","physical","pick","picture","piece","place","plan","plant","play","player","pm",
        "point","police","policy","political","politics","pool","poor","pop","popular","population",
        "position","positive","possible","post","pot","potential","pound","power","practice",
        "pray","prepare","present","president","pressure","pretty","prevent","price","private",
        "probably","problem","process","produce","product","production","professional","professor",
        "program","project","property","protect","prove","provide","public","pull","purpose","push",
        "put","quality","quantity","question","quickly","quiet","quite","race","radio","raise",
        "range","rank","rapid","rate","rather","reach","read","ready","real","reality","realize",
        "really","reason","receive","recent","recently","recognize","record","red","reduce",
        "reflect","region","relate","relationship","religious","remain","remember","remove",
        "report","represent","republican","require","research","resource","respond","response",
        "responsibility","rest","result","return","reveal","rich","right","rise","risk","road",
        "rock","role","roll","room","rough","round","route","row","rule","run","rural","safe",
        "safety","same","sample","save","say","scale","scene","school","science","scientific",
        "scientist","score","screen","sea","season","seat","second","secret","secretary","section",
        "security","see","seed","seek","seem","seize","sell","send","senior","sense","sensitive",
        "sentence","separate","sequence","series","serious","seriously","serve","service","session",
        "set","setting","settle","seven","several","sex","sexual","shake","shall","shape","share",
        "she","sheet","shelf","shift","shine","ship","shirt","shit","shock","shoe","shoot",
        "shopping","short","shortly","shot","should","shoulder","shout","show","shower","shrug",
        "shut","sick","side","sigh","sign","signal","significant","significantly","silent",
        "silver","similar","similarly","simple","simply","since","sing","single","sink","sir",
        "sister","sit","site","situation","six","size","skill","skin","sky","sleep","slice",
        "slide","slight","slightly","slip","slow","slowly","small","smart","smell","smile",
        "smoke","smooth","snap","snow","so","soccer","social","society","soft","software",
        "soil","solar","soldier","solid","solution","solve","some","somebody","somehow",
        "someone","something","sometimes","somewhat","somewhere","son","song","soon","sorry",
        "sort","soul","sound","soup","source","south","southern","space","speak","speaker",
        "special","specific","specifically","speech","speed","spend","spirit","spiritual",
        "split","spokesman","sport","spot","spread","spring","square","squeeze","stability",
        "stable","staff","stage","stair","stake","stand","standard","standing","star","stare",
        "start","state","statement","station","statistics","status","stay","steady","steal",
        "steel","step","stick","still","stir","stock","stomach","stone","stop","storage",
        "store","storm","story","straight","strange","stranger","strategic","strategy",
        "stream","street","strength","strengthen","stress","stretch","strike","string",
        "strip","stroke","strong","strongly","structure","student","studio","study","stuff",
        "stupid","style","subject","submit","subsequent","substance","substantial","succeed",
        "success","successful","successfully","such","sudden","suddenly","sue","suffer",
        "sufficient","suggest","suggestion","suit","suitable","suite","summer","sun","super",
        "supply","support","supporter","suppose","supposed","supreme","sure","surely","surface",
        "surgery","surprise","surprised","surprising","surprisingly","surround","survey",
        "survive","suspect","sustain","swear","sweep","sweet","swim","swing","switch","symbol",
        "symptom","system","table","tail","take","tale","talent","talk","tall","tank","tap",
        "tape","target","task","taste","tax","tea","teach","teacher","teaching","team","tear",
        "technical","technique","technology","teen","teenager","telephone","telescope",
        "television","tell","temperature","temporary","ten","tend","tendency","tennis","tension",
        "tent","term","terms","terrible","territory","test","testify","testing","text","than",
        "thank","thanks","that","the","theater","their","them","theme","themselves","then",
        "theory","therapy","there","therefore","these","they","thick","thin","thing","think",
        "thinking","third","thirty","this","those","though","thought","thousand","threat",
        "three","thrive","throat","through","throughout","throw","thumb","thus","ticket","tie",
        "tight","time","tiny","tip","tire","tired","tissue","title","to","today","toe","together",
        "toilet","token","told","tomorrow","tone","tongue","tonight","too","tool","tooth","top",
        "topic","toss","total","totally","touch","tough","tour","toward","towards","tower","town",
        "toy","trace","track","trade","tradition","traditional","traffic","tragedy","trail",
        "train","training","transfer","transform","transformation","transition","translate",
        "transportation","travel","treat","treatment","treaty","tree","tremendous","trend",
        "trial","tribe","trick","trip","troop","tropical","trouble","truck","true","truly",
        "trust","truth","try","tube","turn","tv","twelve","twenty","twice","twin","two",
        "type","typical","typically","ugly","ultimate","ultimately","unable","uncle","under",
        "undergo","understand","understanding","unfortunately","uniform","union","unique",
        "unit","united","universal","universe","university","unknown","unless","unlike",
        "unlikely","until","unusual","up","upon","upper","urban","urge","us","use","used",
        "useful","user","usual","usually","utility","vacation","valley","valuable","value",
        "variable","variation","variety","various","vary","vast","vegetable","vehicle","venue",
        "version","very","vessel","veteran","via","victim","victory","video","view","viewer",
        "village","violation","violence","violent","virtually","virtue","virus","visible",
        "vision","visit","visitor","visual","vital","voice","volume","volunteer","vote","voter",
        "vs","vulnerable","wage","wait","wake","walk","wall","wander","want","war","warm","warn",
        "warning","wash","waste","watch","water","wave","way","we","weak","wealth","wealthy",
        "weapon","wear","weather","wedding","week","weekend","weekly","weigh","weight","welcome",
        "welfare","well","west","western","wet","what","whatever","wheel","when","whenever",
        "where","whereas","whether","which","while","whisper","white","who","whole","whom",
        "whose","why","wide","widely","widespread","wife","wild","will","willing","win","wind",
        "window","wine","wing","winner","winter","wipe","wire","wisdom","wise","wish","with",
        "withdraw","within","without","witness","woman","wonder","wonderful","wood","wooden",
        "word","work","worker","working","works","workshop","world","worried","worry","worth",
        "would","wound","wrap","write","writer","writing","wrong","yard","yeah","year","yell",
        "yellow","yes","yesterday","yet","yield","you","young","your","yours","yourself",
        "youth","zone", "keyboard", "practice", "accuracy", "legend", "symbol", "character"
    ];

    const punctuations = [".", ",", "?", "!"];
    const numbersArr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const symbolsArr = ["@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "+", "=", "{", "}", "[", "]", "|", ";", ":", "<", ">", "/", "~", "`"];
    let words = [];
    let currentLength = 0;

    for (let i = 0; i < count; i++) {
        let word;
        const rand = Math.random();
        if (includeNumbers && rand < 0.04) { // Reduced chance for pure numbers/symbols
            word = numbersArr[Math.floor(Math.random() * numbersArr.length)];
        } else if (includeSymbols && rand < 0.08) {
            word = symbolsArr[Math.floor(Math.random() * symbolsArr.length)];
        } else {
            // Select word based on length constraints
            let suitableWords = wordList.filter(w => w.length >= minLength && w.length <= maxLength);
            if (suitableWords.length === 0) suitableWords = wordList.filter(w => w.length >= minLength); // Fallback if no words in maxLength
            if (suitableWords.length === 0) suitableWords = [wordList[Math.floor(Math.random() * wordList.length)]]; // Absolute fallback
            word = suitableWords[Math.floor(Math.random() * suitableWords.length)];
        }
        
        // Add punctuation sometimes, but not to standalone numbers/symbols or the last word
        if (includePunctuation && typeof word === 'string' && 
            !symbolsArr.includes(word) && !numbersArr.includes(word) && 
            Math.random() < 0.18 && i < count - 1) {
            word += punctuations[Math.floor(Math.random() * punctuations.length)];
        }
        words.push(word);
        currentLength += word.length + 1; // +1 for space
    }
    let resultText = words.join(" ");
    // Ensure the text ends with a period if punctuation is enabled and it doesn't already have one
    if (includePunctuation && resultText.length > 0 && !punctuations.includes(resultText.slice(-1))) {
        resultText += ".";
    }
    return resultText;
}


function generateAdaptiveTextEngine(baseWordCount, charPerfData, isLegendary = false) {
    // charPerfData is the global charPerformance object
    let problematicEntries = Object.entries(charPerfData)
        .map(([char, data]) => ({
            char,
            accuracy: data.total > 0 ? (data.correct / data.total) : 1, // Default to 1 (100%) if no total
            totalAttempts: data.total || 0,
            // Score: lower is worse. Penalize low accuracy, high error rate.
            // Give a small weight to characters typed more often but still error-prone.
            score: (data.total > 0 ? (data.correct / data.total) : 1) - 
                   (data.incorrect / (data.total + ADAPTIVE_MIN_ATTEMPTS_FOR_CONSIDERATION)) + 
                   (data.total / (baseWordCount * 5)) * 0.03 
        }))
        .filter(item => item.totalAttempts >= ADAPTIVE_MIN_ATTEMPTS_FOR_CONSIDERATION && item.accuracy < ADAPTIVE_ACCURACY_THRESHOLD);

    problematicEntries.sort((a, b) => a.score - b.score); // Sort by score, worst first

    let exerciseTitle = "Adaptive Training";
    if (problematicEntries.length === 0 && Object.keys(charPerfData).length > 10) {
        exerciseTitle += ": Fine-tuning Speed!";
        return { text: generateRandomWordsEngine(baseWordCount, isLegendary ? 4 : 3, isLegendary ? 12 : 9, true, true, isLegendary), title: exerciseTitle };
    } else if (problematicEntries.length === 0) {
        exerciseTitle += ": Building Foundation";
        return { text: generateRandomWordsEngine(baseWordCount, 3, 7, true), title: exerciseTitle };
    }

    exerciseTitle += ": Targeting Weaknesses";
    let adaptiveTextParts = [];
    const targetChars = problematicEntries.slice(0, ADAPTIVE_TARGET_PROBLEM_CHARS).map(pc => pc.char);
    
    let wordBank = generateRandomWordsEngine(Math.max(20, baseWordCount), 2, 7, true).split(' '); // Base common words
    
    targetChars.forEach(tc => {
        wordBank.push(tc, tc + tc, tc + "e", "a" + tc, tc + "s", "i" + tc + "n"); // Simple words with target
        // Add common error pairs if available from charPerfData
        const charData = charPerfData[tc];
        if (charData && charData.errorsMade) {
            const commonMistakes = Object.entries(charData.errorsMade).sort((a,b) => b[1] - a[1]);
            if (commonMistakes.length > 0) {
                wordBank.push(tc + commonMistakes[0][0] + tc); // e.g. target_error_target
                wordBank.push(commonMistakes[0][0] + tc + commonMistakes[0][0]); // error_target_error
            }
        }
    });
    // Ensure wordBank isn't empty
    if(wordBank.length === 0) wordBank = ["the", "quick", "brown", "fox"];


    // Construct the text, ensuring problem characters/words are interspersed
    let problemCharWordCount = 0;
    const maxProblemCharWords = Math.floor(baseWordCount * ADAPTIVE_PROBLEM_CHAR_WEIGHT);

    for (let i = 0; i < baseWordCount; i++) {
        let chosenWord;
        // Try to inject a problematic character or related word
        if (problemCharWordCount < maxProblemCharWords && targetChars.length > 0 && Math.random() < 0.45) {
            const problemWordCandidates = wordBank.filter(w => targetChars.some(tc => w.includes(tc)));
            if (problemWordCandidates.length > 0) {
                chosenWord = problemWordCandidates[Math.floor(Math.random() * problemWordCandidates.length)];
                problemCharWordCount++;
            } else {
                chosenWord = wordBank[Math.floor(Math.random() * wordBank.length)];
            }
        } else {
            chosenWord = wordBank[Math.floor(Math.random() * wordBank.length)];
        }
        adaptiveTextParts.push(chosenWord);
    }
    
    let generatedText = adaptiveTextParts.join(" ").replace(/\s+/g, ' ').trim();

    if (isLegendary) { 
        const symbols = "!@#$%^&*()_+{}[]:;'<>,.?/\\|-=";
        let legendaryParts = generatedText.split(' ');
        for(let i=0; i < Math.min(5, Math.floor(legendaryParts.length / 5)); i++) { // Add up to 5 symbols
            legendaryParts.splice(Math.floor(Math.random() * legendaryParts.length), 0, symbols[Math.floor(Math.random() * symbols.length)]);
        }
        generatedText = legendaryParts.join(" ");
    }

    if (generatedText.length > 0 && !".?!".includes(generatedText.slice(-1))) {
        generatedText += ".";
    }
    
    return { text: generatedText || "Practice focusing on your common errors.", title: exerciseTitle };
}


// Assign generator functions to TEXT_SAMPLES after they are defined
TEXT_SAMPLES.random.easy = () => generateRandomWordsEngine(25, 3, 6);
TEXT_SAMPLES.random.medium = () => generateRandomWordsEngine(35, 4, 8);
TEXT_SAMPLES.random.hard = () => generateRandomWordsEngine(45, 5, 10, true);
TEXT_SAMPLES.random.expert = () => generateRandomWordsEngine(50, 5, 12, true, true);
TEXT_SAMPLES.random.legendary = () => generateRandomWordsEngine(60, 3, 15, true, true, true);

TEXT_SAMPLES.adaptive.easy = () => generateAdaptiveTextEngine(25, charPerformance).text; // charPerformance will be global from main.js
TEXT_SAMPLES.adaptive.medium = () => generateAdaptiveTextEngine(35, charPerformance).text;
TEXT_SAMPLES.adaptive.hard = () => generateAdaptiveTextEngine(45, charPerformance).text;
TEXT_SAMPLES.adaptive.expert = () => generateAdaptiveTextEngine(50, charPerformance, true).text; // Expert adaptive is harder
TEXT_SAMPLES.adaptive.legendary = () => generateAdaptiveTextEngine(60, charPerformance, true).text;


// This function is called by main.js to get the text
function getExerciseText(mode, difficulty, drillKey, currentGlobalCharPerformance) {
    let text;
    let titlePrefix = "";

    if (mode === 'drills' && drillKey && DRILL_DEFINITIONS[drillKey]) {
        text = DRILL_DEFINITIONS[drillKey].text;
        titlePrefix = `Drill: ${DRILL_DEFINITIONS[drillKey].name}`;
    } else {
        const modeSamples = TEXT_SAMPLES[mode];
        if (!modeSamples) {
            console.error("Invalid mode selected:", mode);
            return { text: TEXT_SAMPLES.standard.easy[0], title: "Standard (Easy)" }; // Fallback
        }

        const textProvider = modeSamples[difficulty];
        if (typeof textProvider === 'function') {
            if (mode === 'adaptive') {
                const adaptiveResult = generateAdaptiveTextEngine(
                    getAdaptiveBaseWordCount(difficulty), 
                    currentGlobalCharPerformance, 
                    difficulty === 'legendary' || difficulty === 'expert'
                );
                text = adaptiveResult.text;
                titlePrefix = adaptiveResult.title; // Use title from adaptive engine
            } else { // For random mode
                text = textProvider();
                titlePrefix = `${capitalizeFirstLetter(mode)} (${capitalizeFirstLetter(difficulty)})`;
            }
        } else if (Array.isArray(textProvider) && textProvider.length > 0) {
            text = textProvider[Math.floor(Math.random() * textProvider.length)];
            titlePrefix = `${capitalizeFirstLetter(mode)} (${capitalizeFirstLetter(difficulty)})`;
        } else {
            console.warn(`No text found for mode: ${mode}, difficulty: ${difficulty}. Falling back.`);
            text = TEXT_SAMPLES.standard.easy[0]; // Default fallback
            titlePrefix = "Standard (Easy)";
        }
    }
    return { text: text || "Error: Could not generate text.", title: titlePrefix };
}

function getAdaptiveBaseWordCount(difficulty) {
    switch(difficulty) {
        case 'easy': return 25;
        case 'medium': return 35;
        case 'hard': return 45;
        case 'expert': return 55;
        case 'legendary': return 65;
        default: return 35;
    }
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}