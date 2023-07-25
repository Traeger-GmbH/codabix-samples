import './style.css'
import * as signalR from './lib/signalR/index.js';

let client = null;

// example nodes
const nodePaths = ['/Nodes/Demo/integerNode', '/Nodes/Demo/stringNode', '/Nodes/Demo/singleNode', '/Nodes/Demo/booleanNode', '/Nodes/Demo/dateTimeNode'];

function createSignalRClient() {
  client = new signalR.Client('http://localhost:8181');
}

async function connect() {
  // Please use your codabix credentials -> username, password
  await client.connect('admin', '1234');
}

function createNodeValueSubscriptions() {
  for (const nodePath of nodePaths) {
    const channel = client.subscribeValueChanges([nodePath]);
    channel.subscribe({
      next: (e) => {
        if (nodePath === nodePaths[0]) {
          document.getElementById('node-value-integer').innerHTML = e.newValue.value;
        } else if (nodePath === nodePaths[1]) {
          document.getElementById('node-value-string').innerHTML = e.newValue.value;
        } else if (nodePath === nodePaths[2]) {
          document.getElementById('node-value-single').innerHTML = e.newValue.value;
        } else if (nodePath === nodePaths[3]) {
          document.getElementById('node-value-boolean').innerHTML = e.newValue.value;
        } else if (nodePath === nodePaths[4]) {
          document.getElementById('node-value-dateTime').innerHTML = new Date(e.newValue.value);
        }
      },
      complete: () => {
        console.log('Subscription has been completed.');
      },
      error: () => {
        this.error = new Error('The requested node with the specified id does not exist.: ' + nodePath);
      }
    });
  }

}

createSignalRClient();

await connect();

createNodeValueSubscriptions();
