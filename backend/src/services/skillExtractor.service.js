const SKILLS = [
  "java",
  "javascript",
  "typescript",
  "python",
  "c",
  "c++",
  "c#",
  "go",
  "ruby",
  "php",
  "kotlin",
  "swift",

  "html",
  "css",
  "react",
  "redux",
  "next.js",
  "vue",
  "angular",
  "tailwind",
  "bootstrap",

  "node.js",
  "node",
  "express",
  "express.js",
  "spring boot",
  "spring",
  "django",
  "flask",
  "fastapi",
  "rest api",
  "graphql",

  "mysql",
  "postgresql",
  "postgres",
  "mongodb",
  "redis",
  "firebase",
  "sqlite",
  "prisma",
  "sql",

  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "git",
  "github",
  "ci/cd",
  "jenkins",
  "linux",

  "machine learning",
  "deep learning",
  "artificial intelligence",
  "ai",
  "ml",
  "nlp",
  "computer vision",
  "tensorflow",
  "pytorch",
  "scikit-learn",
  "pandas",
  "numpy",

  "data structures",
  "algorithms",
  "dsa",
  "oops",
  "object oriented programming",
  "dbms",
  "operating system",
  "computer networks",

  "postman",
  "jira",
  "figma",
  "vscode",
];

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s+#./-]/g, " ");
};

const escapeRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const extractSkills = (text) => {
  const normalizedText = normalizeText(text);

  const foundSkills = SKILLS.filter((skill) => {
    const normalizedSkill = normalizeText(skill);

    const regex = new RegExp(
      `(^|\\s)${escapeRegex(normalizedSkill)}(\\s|$)`,
      "i"
    );

    return regex.test(normalizedText);
  });

  return [...new Set(foundSkills)];
};

module.exports = {
  extractSkills,
};