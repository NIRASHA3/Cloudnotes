// utils/templates.js
import { 
  FaUsers, 
  FaProjectDiagram, 
  FaBook, 
  FaShoppingCart,
  FaGraduationCap,
  FaCalendarAlt,
  FaListUl,
  FaLightbulb,
  FaQuestionCircle,
  FaLink,
  FaSun,
  FaStar,
  FaRocket,
  FaDollarSign
} from 'react-icons/fa';

export const noteTemplates = {
  meeting: {
    title: "Meeting Notes",
    content: `<h2>Meeting Details</h2>
<p><strong>Date:</strong> <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Date]</span></p>
<p><strong>Attendees:</strong> <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Names]</span></p>
<p><strong>Agenda:</strong></p>
<ul>
  <li>[Agenda item 1]</li>
  <li>[Agenda item 2]</li>
  <li>[Agenda item 3]</li>
</ul>

<h2>Discussion Points</h2>
<ul>
  <li>[Key point 1]</li>
  <li>[Key point 2]</li>
  <li>[Key point 3]</li>
</ul>

<h2>Action Items</h2>
<ul>
  <li><input type="checkbox"> [Task 1] - <span contenteditable="false" style="background: #fff3cd; padding: 2px 6px; border-radius: 4px;">[Assignee]</span> - <span contenteditable="false" style="background: #fff3cd; padding: 2px 6px; border-radius: 4px;">[Due date]</span></li>
  <li><input type="checkbox"> [Task 2] - <span contenteditable="false" style="background: #fff3cd; padding: 2px 6px; border-radius: 4px;">[Assignee]</span> - <span contenteditable="false" style="background: #fff3cd; padding: 2px 6px; border-radius: 4px;">[Due date]</span></li>
</ul>

<h2>Next Steps</h2>
<p>[Summary of next steps]</p>`,
    category: "work",
    tags: ["meeting", "work", "minutes"],
    icon: FaUsers,
    description: "Structured format for meeting notes with action items"
  },
  
  project: {
    title: "Project Plan",
    content: `<h2>Project Overview</h2>
<p><strong>Project Name:</strong> <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Project Name]</span></p>
<p><strong>Objective:</strong> <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Project objective]</span></p>
<p><strong>Timeline:</strong> <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Start date]</span> - <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[End date]</span></p>

<h2>Key Milestones</h2>
<ul>
  <li><input type="checkbox"> [Milestone 1] - <span contenteditable="false" style="background: #fff3cd; padding: 2px 6px; border-radius: 4px;">[Due date]</span></li>
  <li><input type="checkbox"> [Milestone 2] - <span contenteditable="false" style="background: #fff3cd; padding: 2px 6px; border-radius: 4px;">[Due date]</span></li>
  <li><input type="checkbox"> [Milestone 3] - <span contenteditable="false" style="background: #fff3cd; padding: 2px 6px; border-radius: 4px;">[Due date]</span></li>
</ul>

<h2>Team Members</h2>
<ul>
  <li>[Role 1]: <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Name]</span></li>
  <li>[Role 2]: <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Name]</span></li>
</ul>

<h2>Resources Needed</h2>
<ul>
  <li>[Resource 1]</li>
  <li>[Resource 2]</li>
  <li>[Resource 3]</li>
</ul>

<h2>Risks & Challenges</h2>
<ul>
  <li>[Risk 1] - <span contenteditable="false" style="background: #ffebee; padding: 2px 6px; border-radius: 4px;">[Mitigation plan]</span></li>
  <li>[Risk 2] - <span contenteditable="false" style="background: #ffebee; padding: 2px 6px; border-radius: 4px;">[Mitigation plan]</span></li>
</ul>`,
    category: "projects",
    tags: ["project", "planning", "milestones"],
    icon: FaProjectDiagram,
    description: "Comprehensive project planning template"
  },
  
  daily: {
    title: "Daily Journal",
    content: `<h2>Daily Journal - <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Date]</span></h2>

<h3>Morning Goals</h3>
<p><strong>Goals for today:</strong></p>
<ul>
  <li><input type="checkbox"> [Goal 1]</li>
  <li><input type="checkbox"> [Goal 2]</li>
  <li><input type="checkbox"> [Goal 3]</li>
</ul>

<h3>Highlights</h3>
<p>[What went well today?]</p>

<h3>Accomplishments</h3>
<ul>
  <li>[Accomplishment 1]</li>
  <li>[Accomplishment 2]</li>
  <li>[Accomplishment 3]</li>
</ul>

<h3>Learnings</h3>
<p>[What did I learn today?]</p>

<h3>Tomorrow's Focus</h3>
<ul>
  <li>[Focus area 1]</li>
  <li>[Focus area 2]</li>
</ul>`,
    category: "personal",
    tags: ["journal", "daily", "reflection"],
    icon: FaBook,
    description: "Daily reflection and planning template"
  },
  
  shopping: {
    title: "Shopping List",
    content: `<h2>Shopping List - <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Store/Date]</span></h2>

<h3>Groceries</h3>
<ul>
  <li><input type="checkbox"> [Item 1]</li>
  <li><input type="checkbox"> [Item 2]</li>
  <li><input type="checkbox"> [Item 3]</li>
  <li><input type="checkbox"> [Item 4]</li>
</ul>

<h3>Household Items</h3>
<ul>
  <li><input type="checkbox"> [Item 1]</li>
  <li><input type="checkbox"> [Item 2]</li>
  <li><input type="checkbox"> [Item 3]</li>
</ul>

<h3>Pharmacy</h3>
<ul>
  <li><input type="checkbox"> [Item 1]</li>
  <li><input type="checkbox"> [Item 2]</li>
</ul>

<h3>Budget: $<span contenteditable="false" style="background: #e8f5e8; padding: 2px 6px; border-radius: 4px;">[Amount]</span></h3>
<p><strong>Total Spent:</strong> $<span contenteditable="false" style="background: #e8f5e8; padding: 2px 6px; border-radius: 4px;">[Amount]</span></p>`,
    category: "shopping",
    tags: ["shopping", "list", "groceries"],
    icon: FaShoppingCart,
    description: "Organized shopping list with categories"
  },
  
  study: {
    title: "Study Notes",
    content: `<h2>Study Topic: <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Topic Name]</span></h2>

<h3>Key Concepts</h3>
<ul>
  <li>[Concept 1]</li>
  <li>[Concept 2]</li>
  <li>[Concept 3]</li>
</ul>

<h3>Important Definitions</h3>
<ul>
  <li><strong>[Term 1]:</strong> [Definition]</li>
  <li><strong>[Term 2]:</strong> [Definition]</li>
  <li><strong>[Term 3]:</strong> [Definition]</li>
</ul>

<h3>Key Takeaways</h3>
<ul>
  <li>[Takeaway 1]</li>
  <li>[Takeaway 2]</li>
  <li>[Takeaway 3]</li>
</ul>

<h3>Questions to Review</h3>
<ul>
  <li>[Question 1]</li>
  <li>[Question 2]</li>
  <li>[Question 3]</li>
</ul>

<h3>References</h3>
<ul>
  <li>[Reference 1]</li>
  <li>[Reference 2]</li>
</ul>`,
    category: "study",
    tags: ["study", "learning", "notes"],
    icon: FaGraduationCap,
    description: "Structured format for study notes and concepts"
  },
  
  event: {
    title: "Event Planning",
    content: `<h2>Event Details</h2>
<p><strong>Event Name:</strong> <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Event Name]</span></p>
<p><strong>Date & Time:</strong> <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Date]</span> at <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Time]</span></p>
<p><strong>Location:</strong> <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Venue]</span></p>

<h3>Checklist</h3>
<ul>
  <li><input type="checkbox"> [Task 1] - <span contenteditable="false" style="background: #fff3cd; padding: 2px 6px; border-radius: 4px;">[Due date]</span></li>
  <li><input type="checkbox"> [Task 2] - <span contenteditable="false" style="background: #fff3cd; padding: 2px 6px; border-radius: 4px;">[Due date]</span></li>
  <li><input type="checkbox"> [Task 3] - <span contenteditable="false" style="background: #fff3cd; padding: 2px 6px; border-radius: 4px;">[Due date]</span></li>
</ul>

<h3>Guest List</h3>
<ul>
  <li>[Guest 1]</li>
  <li>[Guest 2]</li>
  <li>[Guest 3]</li>
</ul>

<h3>Supplies Needed</h3>
<ul>
  <li>[Supply 1]</li>
  <li>[Supply 2]</li>
  <li>[Supply 3]</li>
</ul>

<h3>Budget</h3>
<p><strong>Total Budget:</strong> $<span contenteditable="false" style="background: #e8f5e8; padding: 2px 6px; border-radius: 4px;">[Amount]</span></p>
<p><strong>Actual Cost:</strong> $<span contenteditable="false" style="background: #e8f5e8; padding: 2px 6px; border-radius: 4px;">[Amount]</span></p>`,
    category: "personal",
    tags: ["event", "planning", "checklist"],
    icon: FaCalendarAlt,
    description: "Complete event planning checklist"
  },
  
  ideas: {
    title: "Ideas & Brainstorming",
    content: `<h2>Idea: <span contenteditable="false" style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">[Idea Title]</span></h2>

<h3>Core Concept</h3>
<p>[Brief description of the idea]</p>

<h3>Key Features</h3>
<ul>
  <li>[Feature 1]</li>
  <li>[Feature 2]</li>
  <li>[Feature 3]</li>
</ul>

<h3>Potential Benefits</h3>
<ul>
  <li>[Benefit 1]</li>
  <li>[Benefit 2]</li>
  <li>[Benefit 3]</li>
</ul>

<h3>Challenges & Considerations</h3>
<ul>
  <li>[Challenge 1]</li>
  <li>[Challenge 2]</li>
</ul>

<h3>Next Steps</h3>
<ul>
  <li><input type="checkbox"> [Step 1]</li>
  <li><input type="checkbox"> [Step 2]</li>
  <li><input type="checkbox"> [Step 3]</li>
</ul>

<h3>Related Ideas</h3>
<ul>
  <li>[Related idea 1]</li>
  <li>[Related idea 2]</li>
</ul>`,
    category: "ideas",
    tags: ["ideas", "brainstorming", "innovation"],
    icon: FaLightbulb,
    description: "Structured format for capturing and developing ideas"
  }
};

export const getTemplate = (templateName) => {
  return noteTemplates[templateName] || null;
};

export const getAllTemplates = () => {
  return Object.entries(noteTemplates).map(([key, template]) => ({
    key,
    ...template
  }));
};