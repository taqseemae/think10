const fs = require('fs');
const file = 'src/routes/consultant.consultations.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/fetchRecallDataFn/g, 'fetchFirefliesDataFn');

// The arguments have changed from { bookingId, botId } to { bookingId, title }
// We need to find how title is constructed. It's usually `Think10 Strategy Session: ${activeSession.topic}`
code = code.replace(
  /botId:\s*activeSession\.recallBotId/g, 
  "title: `Think10 Strategy Session: ${activeSession.topic}`"
);

// We should also replace references to activeSession.recallBotId if any in the UI
// Let's replace the button logic that depends on recallBotId. 
// "if (activeSession.recallBotId)" -> "if (activeSession.status === 'completed' || activeSession.status === 'scheduled')"
// Actually, it's safer to just check if activeSession has a topic.
code = code.replace(/!activeSession\.recallBotId/g, '!activeSession.topic');
code = code.replace(/activeSession\.recallBotId/g, 'activeSession.topic');

fs.writeFileSync(file, code);
console.log('Modified consultant.consultations.tsx');
