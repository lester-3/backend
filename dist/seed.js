"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const email_1 = __importDefault(require("./models/email"));
const contact_1 = __importDefault(require("./models/contact"));
const photo_1 = __importDefault(require("./models/photo"));
const driveFile_1 = __importDefault(require("./models/driveFile"));
const profile_1 = __importDefault(require("./models/profile"));
const sampleEmails = [
    {
        from_name: 'GitHub', from_email: 'noreply@github.com', to_name: 'Me', to_email: 'me@nmail.com',
        subject: '[GitHub] Your repository has a new issue',
        body: `<div style="font-family: Arial, sans-serif;"><h2>New Issue: #42 - Login page not responsive on mobile</h2><p><strong>opencode-dev</strong> opened this issue 2 hours ago.</p><p>The login page doesn't render properly on screens smaller than 768px. The form fields overlap and the submit button is hidden below the fold.</p><blockquote style="border-left: 3px solid #d1d5db; padding-left: 12px; margin: 12px 0; color: #555;">Steps to reproduce:<br/>1. Open the login page on a mobile device<br/>2. Observe the layout<br/>3. Try to scroll to see the submit button</blockquote><p>View on GitHub: <a href="#">https://github.com/test/repo/issues/42</a></p></div>`,
        folder: 'inbox', starred: 1, read: 0,
    },
    {
        from_name: 'Alice Johnson', from_email: 'alice@example.com', to_name: 'Me', to_email: 'me@nmail.com',
        subject: 'Re: Project Q3 roadmap',
        body: `<div style="font-family: Arial, sans-serif;"><p>Hey,</p><p>Thanks for sending over the roadmap. I've reviewed it and I think the timeline for the authentication overhaul looks solid. A few notes:</p><ul><li>We should allocate 2 extra days for QA on the auth migration</li><li>The API versioning piece might need to start earlier given the dependency on the mobile app release</li><li>Let's sync with the design team about the new onboarding flow</li></ul><p>Let me know when you want to meet to discuss further.</p><p>Best,<br/>Alice</p></div>`,
        folder: 'inbox', starred: 0, read: 0,
    },
    {
        from_name: 'Bob Chen', from_email: 'bob@example.com', to_name: 'Me', to_email: 'me@nmail.com',
        subject: 'Invoice for September 2024',
        body: `<div style="font-family: Arial, sans-serif;"><p>Dear Customer,</p><p>Please find attached the invoice for services rendered in September 2024.</p><table style="width: 100%; border-collapse: collapse; margin: 16px 0;"><tr style="background: #f3f4f6;"><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th><th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Amount</th></tr><tr><td style="padding: 8px; border: 1px solid #ddd;">Cloud Hosting - Premium Plan</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$299.00</td></tr><tr><td style="padding: 8px; border: 1px solid #ddd;">Domain Renewal (3 years)</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$45.00</td></tr><tr style="font-weight: bold;"><td style="padding: 8px; border: 1px solid #ddd;">Total</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$344.00</td></tr></table><p>Payment is due within 30 days.</p><p>Thank you for your business!</p></div>`,
        folder: 'inbox', starred: 0, read: 1,
    },
    {
        from_name: 'Calendar', from_email: 'calendar@notifications.google.com', to_name: 'Me', to_email: 'me@nmail.com',
        subject: 'Reminder: Team Standup tomorrow at 9:30 AM',
        body: `<div style="font-family: Arial, sans-serif;"><h3>📅 Event Reminder</h3><p><strong>Team Standup</strong></p><p><strong>When:</strong> Tomorrow, 9:30 AM - 9:45 AM</p><p><strong>Where:</strong> Google Meet - <a href="#">https://meet.google.com/abc-defg-hij</a></p><p><strong>Description:</strong> Daily standup meeting. Please be prepared to discuss what you worked on yesterday, what you're working on today, and any blockers.</p><p>Attendees: You + 5 others</p></div>`,
        folder: 'inbox', starred: 0, read: 1,
    },
    {
        from_name: 'Stripe', from_email: 'notifications@stripe.com', to_name: 'Me', to_email: 'me@nmail.com',
        subject: 'New payment received — $49.99',
        body: `<div style="font-family: Arial, sans-serif;"><p>You've received a payment of <strong>$49.99</strong>.</p><p><strong>From:</strong> Sarah Williams</p><p><strong>Description:</strong> Premium Subscription - Monthly</p><p><strong>Date:</strong> Today at 2:34 PM</p><hr style="margin: 16px 0;"/><p>View payment details in your <a href="#">Stripe Dashboard</a>.</p></div>`,
        folder: 'inbox', starred: 0, read: 0,
    },
    {
        from_name: 'Me', from_email: 'me@nmail.com', to_name: 'David Park', to_email: 'david@example.com',
        subject: 'Proposal for new feature: Dark Mode',
        body: `<div style="font-family: Arial, sans-serif;"><p>Hi David,</p><p>I've put together a proposal for adding dark mode support to our application. Here's a summary:</p><h3>Motivation</h3><p>User surveys indicate that 68% of our users prefer dark mode for evening usage. Competitor analysis shows all major apps now support it.</p><h3>Implementation Plan</h3><ol><li>CSS variables for theming (2 days)</li><li>React context for theme switching (1 day)</li><li>Update all components to use theme variables (3 days)</li><li>Testing and QA (2 days)</li></ol><p>Total estimate: <strong>8 days</strong></p><p>Let me know what you think!</p><p>Best,<br/>Me</p></div>`,
        folder: 'sent', starred: 0, read: 1,
    },
    {
        from_name: 'Me', from_email: 'me@nmail.com', to_name: 'Engineering Team', to_email: 'eng-team@example.com',
        subject: 'Sprint Retrospective - Week 38',
        body: `<div style="font-family: Arial, sans-serif;"><p>Hi team,</p><p>Here's a quick summary of our sprint retrospective:</p><h3>What went well ✅</h3><ul><li>Shipped the new dashboard on time</li><li>Test coverage improved from 72% to 84%</li><li>Code review turnaround time decreased by 40%</li></ul><h3>What could be better 🔧</h3><ul><li>More upfront planning for cross-team dependencies</li><li>Better documentation for the new API endpoints</li></ul><h3>Action Items</h3><ul><li>Schedule a design sync for next sprint</li><li>Create ADR template for architecture decisions</li></ul><p>Thanks for a great sprint everyone!</p></div>`,
        folder: 'sent', starred: 0, read: 1,
    },
    {
        from_name: 'Newsletter', from_email: 'newsletter@techweekly.com', to_name: 'Me', to_email: 'me@nmail.com',
        subject: 'Tech Weekly: AI, Rust and the Future of WebDev',
        body: `<div style="font-family: Arial, sans-serif;"><h2>Tech Weekly Digest</h2><p>Here are this week's top stories:</p><div style="margin: 16px 0; padding: 12px; background: #f3f4f6; border-radius: 8px;"><h3 style="margin: 0 0 8px;">🔬 AI-Powered Code Review is Here</h3><p>New tools are using LLMs to automatically review pull requests, catching bugs before they reach production.</p></div><div style="margin: 16px 0; padding: 12px; background: #f3f4f6; border-radius: 8px;"><h3 style="margin: 0 0 8px;">🦀 Rust 1.80 Released</h3><p>The latest Rust release brings improved compile times and new language features.</p></div><div style="margin: 16px 0; padding: 12px; background: #f3f4f6; border-radius: 8px;"><h3 style="margin: 0 0 8px;">⚡ WebAssembly on the Server</h3><p>Why Wasm is becoming a serious contender for server-side computing.</p></div><p><a href="#">Read full articles →</a></p></div>`,
        folder: 'inbox', starred: 0, read: 0,
    },
    {
        from_name: 'Slack', from_email: 'notifications@slack.com', to_name: 'Me', to_email: 'me@nmail.com',
        subject: '13 unread messages in #general',
        body: `<div style="font-family: Arial, sans-serif;"><p>You have <strong>13 unread messages</strong> in <strong>#general</strong> on your workspace.</p><p><strong>Latest message from @john:</strong></p><blockquote style="border-left: 3px solid #4A154B; padding-left: 12px; margin: 12px 0; color: #555;">Anyone have the credentials for the staging environment? Need to test the new deployment.</blockquote><p><a href="#">Open Slack</a> · <a href="#">Mute notifications</a></p></div>`,
        folder: 'inbox', starred: 0, read: 1,
    },
    {
        from_name: 'Me', from_email: 'me@nmail.com', to_name: 'Support Team', to_email: 'support@example.com',
        subject: 'Draft: Updated FAQ for new release',
        body: `<div style="font-family: Arial, sans-serif;"><p>Hi team,</p><p>I've started working on the updated FAQ for v2.0 release. Here's what I have so far:</p><h3>Q: How do I migrate from v1.x to v2.0?</h3><p>A: We've created a migration script that will automatically update your database schema. Please run <code>npm run migrate</code> before upgrading.</p><h3>Q: Are the old API endpoints still supported?</h3><p>A: Yes, but they're deprecated. We recommend moving to the new /api/v2/ endpoints.</p><p>Still working on this. Feedback welcome!</p></div>`,
        folder: 'drafts', starred: 0, read: 1,
    },
    {
        from_name: 'System Admin', from_email: 'admin@nmail.com', to_name: 'All Users', to_email: 'all@nmail.com',
        subject: 'Scheduled Maintenance this Saturday',
        body: `<div style="font-family: Arial, sans-serif;"><h3>Scheduled Maintenance Notice</h3><p><strong>Date:</strong> Saturday, October 5</p><p><strong>Time:</strong> 2:00 AM - 6:00 AM EST</p><p><strong>Impact:</strong> nmail will be unavailable during this window</p><p>We will be upgrading our infrastructure to improve performance and reliability. During this time, all services will be temporarily unavailable.</p><p>Please plan accordingly. We apologize for any inconvenience.</p><p>— nmail Team</p></div>`,
        folder: 'inbox', starred: 0, read: 1,
    },
    {
        from_name: 'Sarah', from_email: 'sarah@example.com', to_name: 'Me', to_email: 'me@nmail.com',
        subject: 'Happy Birthday! 🎂',
        body: `<div style="font-family: Arial, sans-serif;"><h2>🎉 Happy Birthday! 🎉</h2><p>Wishing you the most amazing day filled with joy, laughter, and lots of cake!</p><p>Hope you have a fantastic year ahead!</p><p>Love,<br/>Sarah ❤️</p></div>`,
        folder: 'trash', starred: 0, read: 1,
    },
];
const sampleContacts = [
    { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 (555) 123-4567' },
    { name: 'Bob Chen', email: 'bob@example.com', phone: '+1 (555) 234-5678' },
    { name: 'Sarah Williams', email: 'sarah@example.com', phone: '+1 (555) 345-6789' },
    { name: 'David Park', email: 'david@example.com', phone: '+1 (555) 456-7890' },
    { name: 'Michael Lee', email: 'michael@example.com', phone: '+1 (555) 567-8901' },
    { name: 'Emily Davis', email: 'emily@example.com', phone: '+1 (555) 678-9012' },
];
const sampleDriveFiles = [
    { name: 'Project Proposal.docx', type: 'Document', size: '2.4 MB' },
    { name: 'Financial Report Q3.xlsx', type: 'Spreadsheet', size: '1.8 MB' },
    { name: 'Team Photo.jpg', type: 'Image', size: '3.2 MB' },
    { name: 'Presentation Deck.pptx', type: 'Presentation', size: '5.7 MB' },
    { name: 'Budget Planning.xlsx', type: 'Spreadsheet', size: '0.9 MB' },
    { name: 'Meeting Notes.txt', type: 'Text', size: '0.1 MB' },
    { name: 'Logo Design.png', type: 'Image', size: '1.5 MB' },
    { name: 'Software Release.zip', type: 'Archive', size: '8.3 MB' },
    { name: 'User Manual.pdf', type: 'Document', size: '4.2 MB' },
    { name: 'Marketing Plan.docx', type: 'Document', size: '3.6 MB' },
    { name: 'Database Backup.sql', type: 'Data', size: '12.0 MB' },
];
const samplePhotos = [
    { label: 'Beach Sunset', month: 'January', color: '#FF6B6B', dateTaken: '2024-01-15', timeTaken: '17:30', description: 'Beautiful sunset at the beach', tags: '["beach","sunset","nature"]' },
    { label: 'Mountain Hike', month: 'February', color: '#4ECDC4', dateTaken: '2024-02-10', timeTaken: '10:15', description: 'View from the top of the trail', tags: '["mountain","hike","outdoor"]' },
    { label: 'City Skyline', month: 'March', color: '#45B7D1', dateTaken: '2024-03-05', timeTaken: '20:00', description: 'Night view of the downtown skyline', tags: '["city","night","skyline"]' },
    { label: 'Garden Flowers', month: 'April', color: '#96CEB4', dateTaken: '2024-04-12', timeTaken: '09:45', description: 'Spring flowers in full bloom', tags: '["garden","flowers","spring"]' },
    { label: 'Coffee Art', month: 'May', color: '#DDA0DD', dateTaken: '2024-05-08', timeTaken: '08:30', description: 'Latte art from my favorite cafe', tags: '["coffee","art","morning"]' },
    { label: 'Lake Reflection', month: 'June', color: '#87CEEB', dateTaken: '2024-06-20', timeTaken: '16:00', description: 'Calm lake reflecting the mountains', tags: '["lake","reflection","nature"]' },
    { label: 'Street Market', month: 'July', color: '#FFA07A', dateTaken: '2024-07-14', timeTaken: '11:20', description: 'Local street market vendors', tags: '["street","market","local"]' },
    { label: 'Book Corner', month: 'August', color: '#8FBC8F', dateTaken: '2024-08-03', timeTaken: '14:00', description: 'Cozy reading nook at the library', tags: '["book","library","cozy"]' },
    { label: 'Autumn Path', month: 'September', color: '#D2691E', dateTaken: '2024-09-22', timeTaken: '15:45', description: 'Leaf-covered walking path', tags: '["autumn","path","leaves"]' },
    { label: 'Rainy Window', month: 'October', color: '#708090', dateTaken: '2024-10-05', timeTaken: '13:10', description: 'Raindrops on the window pane', tags: '["rain","window","cozy"]' },
    { label: 'Snowy Street', month: 'November', color: '#B0C4DE', dateTaken: '2024-11-18', timeTaken: '09:00', description: 'First snowfall of the season', tags: '["snow","winter","street"]' },
    { label: 'Holiday Lights', month: 'December', color: '#FFD700', dateTaken: '2024-12-24', timeTaken: '19:30', description: 'Christmas lights display', tags: '["holiday","lights","christmas"]' },
];
async function seedDatabase() {
    const emailCount = await email_1.default.countDocuments();
    if (emailCount === 0) {
        await email_1.default.insertMany(sampleEmails.map((e, index) => ({
            ...e,
            created_at: new Date(Date.now() - index * 3 * 3600000),
            updated_at: new Date(Date.now() - index * 3 * 3600000),
        })));
        console.log('Seeded emails');
    }
    const contactCount = await contact_1.default.countDocuments();
    if (contactCount === 0) {
        await contact_1.default.insertMany(sampleContacts);
        console.log('Seeded contacts');
    }
    const driveCount = await driveFile_1.default.countDocuments();
    if (driveCount === 0) {
        await driveFile_1.default.insertMany(sampleDriveFiles);
        console.log('Seeded drive files');
    }
    const photoCount = await photo_1.default.countDocuments();
    if (photoCount === 0) {
        await photo_1.default.insertMany(samplePhotos);
        console.log('Seeded photos');
    }
    const profileCount = await profile_1.default.countDocuments();
    if (profileCount === 0) {
        await profile_1.default.create({ name: 'Me', email: 'me@nmail.com', phone: '', avatar_path: '' });
        console.log('Seeded profile');
    }
}
