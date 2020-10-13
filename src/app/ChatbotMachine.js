import { Machine, assign } from "xstate";

const chatbotMachine = Machine({
  id: "chatbot",
  initial: "start",
  context: {
  },
  states: {
    start: {
      on: {
        RECEIVE_MESSAGE: [{
          target: "menu",
          actions: [
            assign((context, event) => { context.chatInterface = event.chatInterface; })
          ]
        }]
      }
    },
    menu : {
      id: "menu",
      initial: "question",
      states: {
        question: {
          onEntry: assign( (context, event) => {
            let message = "Hi! \nWhat would you like to do?\n1. File Complaint\n2. Track Complaint";
            context.chatInterface.sendMessageToUser(message);
          }),
          on: {
            RECEIVE_MESSAGE: [{
              target: "processUserRespone"
            }]
          }
        },
        processUserRespone: {
          onEntry: assign((context, event) => {
            context.chatInterface = event.chatInterface;
            context.message = {
              isValid: event.message == "fileComplaint" || event.message == "trackComplaint",
              messageContent: event.message
            }
          }),
          always : [
            {
              target: "question",
              cond: (context, event) => {
                return ! context.message.isValid;
              }
            },
            {
              target: "#city",
              cond: (context, event) => {
                return context.message.messageContent == "fileComplaint";
              }
            },
            {
              target: "#trackComplaint",
              cond: (context, event) => { 
                return  context.message.messageContent == "trackComplaint"; 
              }
            }
          ]
        } 
      }
    },
    city: {
      id: "city",
      initial: "question",
      states: {
        question: {
          onEntry: assign( (context, event) => {
            let message = "Please enter name of the city";
            context.chatInterface.sendMessageToUser(message);
          }),
          on: {
            RECEIVE_MESSAGE: [{
              target: "processUserRespone"
            }]
          }
        },
        processUserRespone: {
          onEntry:  assign((context, event) => {
            context.message = {
              isValid: true,
              messageContent: event.message
            }
          }),
          always : [
            {
              target: "question",
              cond: (context, event) => {
                return ! context.message.isValid;
              }
            },
            {
              target: "#filedSuccessfully"
            }
          ]
        }
      }
    },
    trackComplaint: {
      id: "trackComplaint",
      type: "final",
      onEntry: assign( (context, event) => {
        //make api call
        console.log("Making an api call to PGR Service");
        let message = "Here are your recent complaints {{details}}";
        let details = "No. - 123, ...";
        message = message.replace("{{details}}", details);
        context.chatInterface.sendMessageToUser(message);
      })
    },
    filedSuccessfully: {
      type: "final",
      id: "filedSuccessfully",
      onEntry: assign((context, event) => {
        //make api call
        console.log("Making api call to PGR Service");
        let message = "Complaint has been filed successfully {{number}}";
        let number = "123";
        message = message.replace("{{number}}", number);
        context.chatInterface.sendMessageToUser(message);
      })
    }
  }
});

export default chatbotMachine;