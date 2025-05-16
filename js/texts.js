// js/texts.js

const ULTRA_LEGENDARY_EXERCISE_TEXT = "Welcome, Typing Legend-in-training. Your mission begins now: 0.1% reach this speed. Decode this: 'Xylophones zigzag quickly; jackrabbits vault bold fences!' Next line - don't blink: $sudo ./launch_mind.exe && echo 'Awakened.' Insert rapid combos: qAzWsXedCrFvTgByHnUjMiK!@#%^&*()_+{}|:\"<>?~. Now imagine this: typing blindfolded while reciting π = 3.14159. Try: [Shift] + ‘complexity’ × [Focus] = Mastery. Code it: if (speed > 100 && accuracy === 100) { becomeLegend(); } Remember, symbols are sacred — []{};:'\",./-=. Conquer nerves. Own the keyboard. Precision over panic. Flow is forged in fire. You are not typing. You are commanding. Legends aren't born — they type their way there.";

const TEXT_SAMPLES = {
    standard: {
        easy: [
            "The quick brown fox jumps over the lazy dog near the river bank.",
            "Practice makes perfect. Keep typing daily to improve your skills.",
            "A journey of a thousand miles begins with a single step forward.",
            "Look up at the stars and not down at your feet. Try to make sense of what you see.",
            "The weather is sunny today with a gentle breeze from the west."
        ],
        medium: [
            "Learning to type efficiently can significantly boost your productivity in many tasks.",
            "Regular practice helps improve muscle memory for keyboard layouts, leading to faster and more accurate typing.",
            "The best way to predict the future is to create it with your own hands and mind.",
            "Technology is just a tool. In terms of getting the kids working together and motivating them, the teacher is the most important.",
            "Challenges are what make life interesting and overcoming them is what makes life meaningful."
        ],
        hard: [
            "The juxtaposition of advanced technology and archaic customs created a unique cultural tapestry, vibrant and complex.",
            "Cryptography involves intricate algorithms and mathematical principles to secure sensitive information, making it unreadable without the correct decryption key.",
            "Success is not final, failure is not fatal: It is the courage to continue that truly counts in the grand scheme of things.",
            "Philosophical inquiries often delve into the nature of existence, consciousness, and the fundamental structure of reality itself.",
            "The symphony orchestra performed a breathtaking rendition of Beethoven's Fifth, captivating the entire audience with its power."
        ],
        expert: [
            "Quantum entanglement describes a bizarre phenomenon where particles become inextricably linked, their fates intertwined instantaneously regardless of the distance separating them.",
            "Bioinformatics leverages sophisticated computational tools and statistical methods to analyze voluminous biological datasets, such as genomic sequences and protein structures, thereby accelerating scientific discovery.",
            "The only limit to our realization of tomorrow will be our doubts of today; therefore, we must strive for excellence with unwavering determination and boundless optimism.",
            "Understanding the neurochemical basis of emotion and cognition requires interdisciplinary approaches, integrating psychology, neuroscience, and molecular biology.",
            "Geopolitical strategists must consider a multifaceted array of variables, including economic interdependencies, cultural nuances, and historical precedents, when formulating foreign policy."
        ],
        legendary: [ULTRA_LEGENDARY_EXERCISE_TEXT]
    },
    code: {
        easy: [
            "function greet(name) {\n  console.log('Hello, ' + name + '!');\n}\ngreet('World');",
            "let count = 0;\nfor (let i = 0; i < 5; i++) {\n  count += (i * 2);\n}\nconsole.log(count);",
            "const PI = 3.14159;\nlet radius = 10;\nlet area = PI * radius * radius;"
        ],
        medium: [
            "const fetchData = async (url) => {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) throw new Error('Network response was not ok.');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Fetch error:', error);\n  }\n};",
            "class Rectangle {\n  constructor(height, width) {\n    this.height = height;\n    this.width = width;\n  }\n\n  get area() {\n    return this.calculateArea();\n  }\n\n  calculateArea() {\n    return this.height * this.width;\n  }\n}",
            "const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(num => num * 2);\nconst sum = doubled.reduce((acc, val) => acc + val, 0);"
        ],
        hard: [
            "document.querySelectorAll('.item.active').forEach(el => {\n  el.addEventListener('click', (e) => {\n    e.stopPropagation();\n    e.target.classList.toggle('highlighted');\n    console.log(`Element ${el.id} clicked.`);\n  });\n});",
            "const memoizedFibonacci = (n, memo = {}) => {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  memo[n] = memoizedFibonacci(n - 1, memo) + memoizedFibonacci(n - 2, memo);\n  return memo[n];\n}; \n// This uses recursion and memoization.",
            "const user = { id: 1, name: 'Jane Doe', email: 'jane.doe@example.com' };\nconst { id, ...userInfo } = user;\nconsole.log(`User ID: ${id}`);\nconsole.log('User Info:', userInfo);"
        ],
        expert: [
            "const stream = fs.createReadStream(filePath, { encoding: 'utf8', highWaterMark: 16384 });\nstream.on('data', (chunk) => {\n  // Process each chunk of data from the file stream\n  processDataChunk(chunk.toString().toUpperCase());\n});\nstream.on('end', () => {\n  console.log('File processing complete. All chunks processed.');\n});\nstream.on('error', (err) => {\n  console.error('An error occurred during file streaming:', err.message);\n});",
            "SELECT \n    e.first_name, \n    e.last_name, \n    d.department_name, \n    j.job_title, \n    s.salary_amount\nFROM \n    employees e\nINNER JOIN \n    departments d ON e.department_id = d.department_id\nINNER JOIN \n    jobs j ON e.job_id = j.job_id\nLEFT JOIN \n    salaries s ON e.employee_id = s.employee_id\nWHERE \n    d.location_id = (SELECT location_id FROM locations WHERE city = 'London') \n    AND s.salary_amount > 60000\nORDER BY \n    s.salary_amount DESC, e.last_name ASC;",
            "const matrixA = [[1, 2], [3, 4]];\nconst matrixB = [[5, 6], [7, 8]];\nfunction multiplyMatrices(m1, m2) {\n  // Basic 2x2 matrix multiplication\n  let result = [[0,0],[0,0]];\n  result[0][0] = m1[0][0]*m2[0][0] + m1[0][1]*m2[1][0];\n  result[0][1] = m1[0][0]*m2[0][1] + m1[0][1]*m2[1][1];\n  result[1][0] = m1[1][0]*m2[0][0] + m1[1][1]*m2[1][0];\n  result[1][1] = m1[1][0]*m2[0][1] + m1[1][1]*m2[1][1];\n  return result;\n}"
        ],
        legendary: [ULTRA_LEGENDARY_EXERCISE_TEXT] 
    },
    quotes: {
        easy: [
            "The only way to do great work is to love what you do. - Steve Jobs",
            "Strive not to be a success, but rather to be of value. - Albert Einstein",
            "Life is what happens when you're busy making other plans. - John Lennon"
        ],
        medium: [
            "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma. - Steve Jobs",
            "The mind is everything. What you think you become. Therefore, guard your thoughts carefully. - Buddha",
            "The only thing necessary for the triumph of evil is for good men to do nothing. - Edmund Burke"
        ],
        hard: [
            "Two things are infinite: the universe and human stupidity; and I'm not sure about the former. - Albert Einstein",
            "The unexamined life is not worth living, for it lacks the depth of self-awareness. - Socrates",
            "Darkness cannot drive out darkness: only light can do that. Hate cannot drive out hate: only love can do that. - Martin Luther King Jr."
        ],
        expert: [
            "Be who you are and say what you feel, because those who mind don't matter, and those who matter don't mind. - Bernard M. Baruch",
            "I have not failed. I've just found 10,000 ways that won't work, each one a lesson learned. - Thomas A. Edison",
            "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. - Ralph Waldo Emerson"
        ],
        legendary: [ULTRA_LEGENDARY_EXERCISE_TEXT]
    },
    // Random and Adaptive modes will use generator functions defined in adaptive.js
    random: { 
        easy: null, medium: null, hard: null, expert: null, legendary: null 
    },
    adaptive: { 
        easy: null, medium: null, hard: null, expert: null, legendary: null
    }
};

const DRILL_DEFINITIONS = {
    homeRow: { 
        name: "Home Row Power", 
        text: "asdf jkl; asdf jkl; aa ss dd ff jj kk ll ;; ad jf sl k; askf jdl; sad lad ask fall dads lads; a lass; a sad lad; a fall; a flask; ask a lad;", 
        description: "Master the fundamental home row keys: a, s, d, f, j, k, l, and semicolon." 
    },
    topRow: { 
        name: "Top Row Sprint", 
        text: "qwerty uiop qwerty uiop qq ww ee rr tt yy uu ii oo pp qt up wr io ey po true quit power type writer error; your older true power is quite potent;", 
        description: "Conquer the top row (q, w, e, r, t, y, u, i, o, p) with speed and accuracy." 
    },
    bottomRow: { 
        name: "Bottom Row Blitz", 
        text: "zxcvbnm zxcvbnm zz xx cc vv bb nn mm zb vn xc bm,./ ,./ ; ,./ ,./? cvbnm zxcvb xcvbn mnbvc zzz xxx ccc vvv bbb nnn mmm", 
        description: "Practice the often tricky bottom row keys: z, x, c, v, b, n, and m." 
    },
    numberRow: { 
        name: "Number Pad Pro", 
        text: "12345 67890 123 456 789 01 29 38 47 56 100 250 1985 2023 11 22 33 44 55 66 77 88 99 00 10 01", 
        description: "Improve your speed with numbers and the number row (0-9)." 
    },
    numberSymbols: {
        name: "Numbers & Symbols",
        text: "1! 2@ 3# 4$ 5% 6^ 7& 8* 9( 0) -_ =+ `~ !@#$%^&*()_+ 123-456-7890 account# 007 email@example.com version_2.5",
        description: "Practice typing numbers along with their corresponding shifted symbols."
    },
    commonWordsEasy: { 
        name: "Common Words I", 
        text: "the of and a to in is you that it he was for on are as with his they I at be this have from or one had by word but not what all were we when your can said", 
        description: "Type frequently used English words quickly. Focus on rhythm and flow." 
    },
    commonWordsMedium: { 
        name: "Common Words II", 
        text: "there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part", 
        description: "Expand your speed on more common English words, including longer ones."
    },
    capitalization: { 
        name: "Capitalization Drill", 
        text: "The Quick Brown Fox. My Name Is Legend. London Is The Capital Of Great Britain. Practice Makes Perfect. Hello World. She Sells Sea Shells By The Sea Shore. Peter Piper Picked A Peck Of Pickled Peppers. Every Good Boy Deserves Fudge.", 
        description: "Practice using the Shift key accurately for capital letters at the beginning of words and sentences." 
    },
    punctuationBasic: { 
        name: "Basic Punctuation", 
        text: "Hello, world. This is a test. Is it working? Yes! I think so. One, two, three. Apples, oranges, and bananas. He said, 'Wait!' She replied, 'Okay.'", 
        description: "Get comfortable with common punctuation: period, comma, question mark, exclamation mark, and apostrophe." 
    },
    punctuationAdvanced: {
        name: "Advanced Punctuation",
        text: "The options are: (1) proceed, (2) delay, or (3) cancel. This is an example of hyphenated-text; it's quite common. \"Are you sure?\" he asked. She nodded; \"Absolutely.\"",
        description: "Practice colons, semi-colons, parentheses, hyphens, and quotation marks."
    },
    mixedAlphaNumeric: { 
        name: "AlphaNumeric Mix", 
        text: "a1 b2 c3 d4 e5 f6 g7 h8 i9 j0 k1 l2 m3 n4 o5 p6 q7 r8 s9 t0 u1 v2 w3 x4 y5 z6 password123 secretCode_007 file_version_2.5 id_A48BX_rev3 date_2024_03_15 user@domain.com", 
        description: "Combine letters and numbers seamlessly, a common requirement in coding and data entry."
    },
    commonBigrams: {
        name: "Common Bigrams",
        text: "th he in er an re es on st nt en at to or ea hi is ou ar as de rt ve ti te et se le sa ed it al",
        description: "Practice typing the most frequent two-letter combinations (bigrams) in English."
    },
    commonTrigrams: {
        name: "Common Trigrams",
        text: "the and ing her ere ent tha nth was eth for tioate hat ter est ers pro res ion all itt sta",
        description: "Improve flow by practicing common three-letter combinations (trigrams)."
    }
};

// Function to provide text, abstracting away the source (samples or drills)
function getTextProvider(mode, difficulty, drillKey) {
    if (mode === 'drills' && drillKey && DRILL_DEFINITIONS[drillKey]) {
        return DRILL_DEFINITIONS[drillKey].text;
    }
    
    const modeSamples = TEXT_SAMPLES[mode];
    if (!modeSamples) return "Error: Invalid mode selected.";

    const difficultySamples = modeSamples[difficulty];
    if (typeof difficultySamples === 'function') { // For random/adaptive generators
        return difficultySamples(); // Execute the generator function
    } else if (Array.isArray(difficultySamples) && difficultySamples.length > 0) {
        return difficultySamples[Math.floor(Math.random() * difficultySamples.length)];
    }
    
    // Fallback or error for unhandled cases
    console.warn(`No text found for mode: ${mode}, difficulty: ${difficulty}, drill: ${drillKey}. Falling back.`);
    return TEXT_SAMPLES.standard.easy[0]; // Default fallback
}