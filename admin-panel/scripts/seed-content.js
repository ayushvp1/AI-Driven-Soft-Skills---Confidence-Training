const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CHALLENGES = [
  {
    id: 1,
    title: "The Power of Hello",
    category: "Communication",
    objective: "Practice basic self-introduction with warmth and clarity.",
    instructions:
      "Record a 1-minute self-introduction including your name, current role/study, and one interesting hobby. Focus on maintaining a steady pace.",
    expected_outcome: "A clear, concise, and engaging introduction.",
    difficulty: "Beginner",
  },
  {
    id: 2,
    title: "The Opinion Minute",
    category: "Communication",
    objective: "Expressing an opinion on a simple topic clearly.",
    instructions:
      "Topic: 'Should AI be taught in schools?'. State your opinion in 60 seconds using the Point-Reason-Example-Point (PREP) method.",
    expected_outcome: "A structured and persuasive statement of opinion.",
    difficulty: "Beginner",
  },
  {
    id: 3,
    title: "Quick Concept Explainer",
    category: "Communication",
    objective: "Explaining a complex idea in simple words (ELIs).",
    instructions:
      "Explain how 'GPS' works to a 10-year-old child. Avoid technical jargon and use a relatable analogy.",
    expected_outcome: "A simple, easy-to-understand explanation of a concept.",
    difficulty: "Intermediate",
  },
  {
    id: 4,
    title: "The Prompt Storyteller",
    category: "Communication",
    objective: "Practice creative thinking and spontaneous narration.",
    instructions:
      "Prompt: 'The old key in the attic...'. Start a story from this sentence and continue for 60 seconds.",
    expected_outcome:
      "A narration that flows naturally without too many filler words.",
    difficulty: "Intermediate",
  },
  {
    id: 5,
    title: "The Pitch",
    category: "Communication",
    objective: "Persuading someone about a value proposition.",
    instructions:
      "Pitch your favorite book or movie to a friend. Make them want to read/watch it within 1 minute.",
    expected_outcome: "Enthusiastic and persuasive delivery.",
    difficulty: "Intermediate",
  },
  {
    id: 6,
    title: "Gratitude Journaling (Speak Out)",
    category: "Communication",
    objective: "Building positive self-belief through vocal affirmations.",
    instructions:
      "Talk about three things you are grateful for today and why. Use positive and confident language.",
    expected_outcome: "A boost in mood and vocal confidence.",
    difficulty: "Beginner",
  },
  {
    id: 7,
    title: "The Reframing Challenge",
    category: "Communication",
    objective: "Turning a negative situation into a learning opportunity.",
    instructions:
      "Recall a recent mistake you made. Describe it and then 'reframe' it as a valuable lesson in 60 seconds.",
    expected_outcome:
      "Growth-oriented mindset and clear communication of insights.",
    difficulty: "Intermediate",
  },
  {
    id: 8,
    title: "Active Listening Response",
    category: "Communication",
    objective: "Demonstrating comprehension and empathy.",
    instructions:
      "Imagine a friend just told you about a stressful day. Record a 45-second empathetic response that summarizes their points and offers support.",
    expected_outcome: "Empathetic tone and accurate summary.",
    difficulty: "Intermediate",
  },
  {
    id: 9,
    title: "The Leadership Vision",
    category: "Communication",
    objective: "Communicating a goal to inspire a team.",
    instructions:
      "Imagine you are leading a small volunteer project. Describe your vision and the first step the team should take.",
    expected_outcome: "Clear, authoritative, and motivating delivery.",
    difficulty: "Advanced",
  },
  {
    id: 10,
    title: "Simplifying Jargon",
    category: "Communication",
    objective: "Improving clarity by removing corporate/academic filters.",
    instructions:
      "Take the phrase 'Leveraging synergies to maximize output' and explain what it actually means using everyday language.",
    expected_outcome: "Translation from jargon to plain, impactful English.",
    difficulty: "Advanced",
  },
  {
    id: 11,
    title: "Event Planning (Leadership)",
    category: "Leadership",
    objective: "Structuring a plan and taking charge.",
    instructions:
      "Outline a schedule for a one-day workshop. Explain the key activities for Morning, Lunch, and Afternoon sessions in 60 seconds.",
    expected_outcome: "Organized thought process and confident planning.",
    difficulty: "Beginner",
  },
  {
    id: 12,
    title: "Virtual Team Lead",
    category: "Leadership",
    objective: "Starting a meeting with energy and purpose.",
    instructions:
      "Simulate the first minute of a virtual team meeting. Welcome everyone, state the meeting goal, and set a positive tone.",
    expected_outcome: "Engaging and authoritative opening.",
    difficulty: "Intermediate",
  },
  {
    id: 13,
    title: "Delegation Master",
    category: "Leadership",
    objective: "Assigning responsibilities effectively.",
    instructions:
      "You have a project with 3 parts: Research, Design, and Presentation. Assign these to 3 imaginary team members based on their hypothetical strengths.",
    expected_outcome: "Clear instructions and logical assignment.",
    difficulty: "Intermediate",
  },
  {
    id: 14,
    title: "Conflict Resolution",
    category: "Leadership",
    objective: "Mediating differences diplomatically.",
    instructions:
      "Two team members disagree on a design choice. Record a 1-minute statement mediating the discussion to find a middle ground.",
    expected_outcome: "Diplomatic, fair, and solution-focused language.",
    difficulty: "Advanced",
  },
  {
    id: 15,
    title: "Inspiring Action",
    category: "Leadership",
    objective: "Motivating others to act.",
    instructions:
      "Your team is tired after a long project. Give a 45-second pep talk to inspire them for the final push.",
    expected_outcome: "High energy and motivating rhetoric.",
    difficulty: "Advanced",
  },
  {
    id: 16,
    title: "Weekly Goal Setting",
    category: "Time Management",
    objective: "Setting clear, actionable goals (SMART).",
    instructions:
      "Verbally list your top 3 goals for this week. Ensure they are Specific, Measurable, Achievable, Relevant, and Time-bound.",
    expected_outcome: "Structured and realistic goal definition.",
    difficulty: "Beginner",
  },
  {
    id: 17,
    title: "The Eisenhower Matrix",
    category: "Time Management",
    objective: "Prioritizing tasks effectively.",
    instructions:
      "You have 4 tasks: A crisis, a long-term plan, a distraction, and busy work. Categorize them into Do, Decide, Delegate, Delete in 60 seconds.",
    expected_outcome: "Clear understanding of priority levels.",
    difficulty: "Intermediate",
  },
  {
    id: 18,
    title: "Pomodoro Explanation",
    category: "Time Management",
    objective: "Structuring work intervals.",
    instructions:
      "Explain to a colleague how you will use the Pomodoro technique to finish a report today. Describe the work/break intervals.",
    expected_outcome: "Clear explanation of the time-boxing technique.",
    difficulty: "Beginner",
  },
  {
    id: 19,
    title: "Strict Agenda Setting",
    category: "Time Management",
    objective: "Respecting time limits.",
    instructions:
      "Create an agenda for a 30-minute meeting. Allocate specific minutes to Introductions, Discussion, and Next Steps to ensure it ends on time.",
    expected_outcome: "Precise time allocation and control.",
    difficulty: "Intermediate",
  },
  {
    id: 20,
    title: "The Art of Saying No",
    category: "Time Management",
    objective: "Protecting your time boundaries.",
    instructions:
      "A colleague asks for help with a non-urgent task, but you have a strict deadline. Politely but firmly decline the request.",
    expected_outcome: "Polite refusal without over-apologizing.",
    difficulty: "Advanced",
  },
];

const EXERCISES = [
  {
    id: 1,
    title: "Mirror Talk",
    duration: "5 minutes",
    difficulty: "Beginner",
    category: "Self-Affirmation",
    purpose:
      "Build comfort with self-expression and reduce self-consciousness by speaking directly to yourself.",
    psychological_benefit:
      "Activates self-recognition pathways in the brain, reduces negative self-talk, and builds familiarity with your own voice and presence.",
    steps: [
      "Stand in front of a mirror in a private space.",
      "Make eye contact with yourself.",
      "Speak out loud about your day, goals, or a topic you're preparing for.",
      "Notice any discomfort and breathe through it.",
      "End by saying one genuine compliment to yourself.",
    ],
  },
  {
    id: 2,
    title: "Positive Affirmation Writing",
    duration: "10 minutes",
    difficulty: "Beginner",
    category: "Journaling",
    purpose:
      "Rewire negative thought patterns by consciously writing positive statements about yourself.",
    psychological_benefit:
      "Engages the brain's reward system, counters cognitive distortions, and builds a mental library of self-supportive thoughts.",
    steps: [
      "Take a blank page or open a notes app.",
      "Write 10 statements starting with 'I am...' or 'I can...'",
      "Focus on qualities you have or are developing.",
      "Read each statement out loud.",
      "Keep this list accessible for daily review.",
    ],
  },
  {
    id: 3,
    title: "Confidence Journaling",
    duration: "15 minutes",
    difficulty: "Beginner",
    category: "Journaling",
    purpose:
      "Track daily wins and reflect on moments of courage to build a confidence memory bank.",
    psychological_benefit:
      "Strengthens neural pathways associated with positive self-image and creates evidence against imposter syndrome.",
    steps: [
      "At the end of each day, write down 3 things you did well.",
      "Note one moment where you felt nervous but acted anyway.",
      "Describe how you felt after taking that action.",
      "Write one thing you're proud of about yourself today.",
      "Review past entries weekly to see your growth.",
    ],
  },
  {
    id: 4,
    title: "30-Second Elevator Pitch",
    duration: "10 minutes",
    difficulty: "Intermediate",
    category: "Public Speaking",
    purpose:
      "Practice concise self-introduction to reduce anxiety in networking or interview situations.",
    psychological_benefit:
      "Reduces fear of being 'put on the spot' by creating a prepared, flexible script that feels natural.",
    steps: [
      "Write a 30-second introduction covering: who you are, what you do, and one interesting fact.",
      "Practice saying it out loud 5 times.",
      "Record yourself and listen back.",
      "Adjust for natural flow and confidence.",
      "Practice in front of a friend or family member.",
    ],
  },
  {
    id: 5,
    title: "Power Pose Practice",
    duration: "2 minutes",
    difficulty: "Beginner",
    category: "Body Language",
    purpose:
      "Use body language to trigger feelings of confidence before high-stakes situations.",
    psychological_benefit:
      "Research suggests expansive postures can increase testosterone and decrease cortisol, promoting confidence.",
    steps: [
      "Find a private space (bathroom, office, etc.).",
      "Stand with feet shoulder-width apart, hands on hips (Wonder Woman pose).",
      "Alternatively, stand with arms raised in a V-shape.",
      "Hold for 2 full minutes while breathing deeply.",
      "Notice any shift in how you feel.",
    ],
  },
  {
    id: 6,
    title: "Fear Ladder Exercise",
    duration: "20 minutes (planning) + ongoing",
    difficulty: "Intermediate",
    category: "Exposure Therapy",
    purpose:
      "Systematically desensitize yourself to feared situations through gradual exposure.",
    psychological_benefit:
      "Based on cognitive-behavioral therapy principles, this builds tolerance to anxiety and proves your capability.",
    steps: [
      "Identify one fear (e.g., speaking up in meetings).",
      "Create a ladder of 5-7 steps from least to most scary.",
      "Example: (1) Think about speaking → (2) Speak to one person → (3) Ask a question in a small group → etc.",
      "Start with the lowest step and practice until comfortable.",
      "Move up only when the current step feels manageable.",
    ],
  },
  {
    id: 7,
    title: "Gratitude for Self",
    duration: "5 minutes",
    difficulty: "Beginner",
    category: "Mindfulness",
    purpose:
      "Shift focus from self-criticism to self-appreciation to build a foundation of self-worth.",
    psychological_benefit:
      "Gratitude practices increase dopamine and serotonin, improving mood and self-perception.",
    steps: [
      "Sit quietly and close your eyes.",
      "Think of three things your body does for you daily.",
      "Think of three skills or qualities you're grateful to have.",
      "Say 'Thank you' to yourself for one effort you made today.",
      "Open your eyes and notice how you feel.",
    ],
  },
  {
    id: 8,
    title: "Rejection Therapy",
    duration: "Variable (one task per day)",
    difficulty: "Advanced",
    category: "Exposure Therapy",
    purpose:
      "Reduce fear of rejection by intentionally seeking small rejections in low-stakes situations.",
    psychological_benefit:
      "Desensitizes the brain's threat response to rejection, proving that rejection is survivable and often not personal.",
    steps: [
      "Each day, make one small request that might be declined.",
      "Examples: Ask for a discount at a store, request to skip a queue, ask a stranger for directions.",
      "The goal is NOT to get a 'yes' but to become comfortable with 'no'.",
      "Journal what happened and how you felt.",
      "Notice how your fear decreases over time.",
    ],
  },
  {
    id: 9,
    title: "Visualization of Success",
    duration: "10 minutes",
    difficulty: "Beginner",
    category: "Mindfulness",
    purpose:
      "Mentally rehearse successful outcomes to prime your brain for confident performance.",
    psychological_benefit:
      "The brain cannot fully distinguish between vivid imagination and reality, so visualization builds neural pathways for success.",
    steps: [
      "Choose an upcoming situation you're nervous about.",
      "Close your eyes and relax your body.",
      "Imagine yourself entering the situation calmly and confidently.",
      "Visualize specific details: your posture, voice, and the positive reactions of others.",
      "Repeat this visualization daily until the event.",
    ],
  },
  {
    id: 10,
    title: "Voice Recording Practice",
    duration: "10 minutes",
    difficulty: "Intermediate",
    category: "Public Speaking",
    purpose:
      "Overcome discomfort with your own voice by recording and reviewing yourself speaking.",
    psychological_benefit:
      "Reduces the 'cringe' response to self-hearing, normalizes your voice in your own perception, and improves self-monitoring skills.",
    steps: [
      "Choose a topic you know well (hobby, work, opinion).",
      "Record yourself speaking for 2-3 minutes.",
      "Listen to the recording without judgment.",
      "Note one thing you liked and one area to improve.",
      "Repeat regularly to track improvement.",
    ],
  },
];

const SCENARIOS = [
  {
    id: 1,
    topic: "The Impact of Artificial Intelligence on Job Markets",
    objective:
      "Discuss whether AI is a threat or an opportunity for future careers.",
    participants: [
      {
        name: "Sarah",
        persona:
          "Optimistic and tech-savvy. Believes AI will create more creative jobs than it destroys.",
        trait: "Collaborative",
        model: "gpt-oss-20b-free",
      },
      {
        name: "David",
        persona:
          "Thoughtful and questioning. Focuses on social equity and ensuring all voices are heard.",
        trait: "Critical",
        model: "gpt-oss-20b-free",
      },
      {
        name: "Priya",
        persona:
          "Balanced and data-driven. Thinks education systems need to evolve rapidly to keep up.",
        trait: "Analytical",
        model: "gpt-oss-20b-free",
      },
    ],
  },
  {
    id: 2,
    topic: "Remote Work vs. Office Culture",
    objective:
      "Determine the best balance for company productivity and employee well-being.",
    participants: [
      {
        name: "James",
        persona:
          "Traditional. Believes spontaneous office interactions are the soul of innovation.",
        trait: "Conservative",
        model: "gpt-oss-20b-free",
      },
      {
        name: "Elena",
        persona:
          "Digital Nomad. Argues that freedom to work from anywhere increases loyalty and focus.",
        trait: "Passionate",
        model: "gpt-oss-20b-free",
      },
      {
        name: "Vikram",
        persona:
          "Hybrid advocate. Believes in 2 days office for team building and 3 days remote for deep work.",
        trait: "Mediator",
        model: "gpt-oss-20b-free",
      },
    ],
  },
];

async function seedContent() {
  console.log("Seeding training content...");

  for (const challenge of CHALLENGES) {
    await prisma.challenge.upsert({
      where: { id: challenge.id },
      update: challenge,
      create: challenge,
    });
  }

  for (const exercise of EXERCISES) {
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      update: exercise,
      create: exercise,
    });
  }

  for (const scenario of SCENARIOS) {
    await prisma.simulationScenario.upsert({
      where: { id: scenario.id },
      update: scenario,
      create: scenario,
    });
  }

  console.log("✅ Seeding completed successfully!");
  await prisma.$disconnect();
}

seedContent().catch((e) => {
  console.error(e);
  process.exit(1);
});
