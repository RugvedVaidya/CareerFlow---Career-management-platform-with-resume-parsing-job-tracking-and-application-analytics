const { extractSkills } = require("./skillExtractor.service");

const calculateMatchScore = (matchedSkills, jobSkills) => {
  if (jobSkills.length === 0) return 0;

  const score = (matchedSkills.length / jobSkills.length) * 100;

  return Math.round(score);
};

const generateSuggestions = (missingSkills) => {
  if (missingSkills.length === 0) {
    return [
      "Your resume matches this job description very well.",
      "Customize your summary section with the company and role keywords.",
      "Add measurable impact points to make your resume stronger.",
    ];
  }

  const suggestions = missingSkills.slice(0, 6).map((skill) => {
    return `Add or highlight ${skill} in your resume if you have experience with it.`;
  });

  suggestions.push("Use keywords from the job description in your resume.");
  suggestions.push("Add project bullet points that prove your relevant skills.");
  suggestions.push("Mention tools, technologies, and outcomes clearly.");

  return suggestions;
};

const analyzeResumeAgainstJob = (resumeText, jobDescription) => {
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobDescription);

  const matchedSkills = jobSkills.filter((skill) =>
    resumeSkills.includes(skill)
  );

  const missingSkills = jobSkills.filter(
    (skill) => !resumeSkills.includes(skill)
  );

  const score = calculateMatchScore(matchedSkills, jobSkills);
  const suggestions = generateSuggestions(missingSkills);

  return {
    score,
    resumeSkills,
    jobSkills,
    matchedSkills,
    missingSkills,
    suggestions,
  };
};

module.exports = {
  analyzeResumeAgainstJob,
};