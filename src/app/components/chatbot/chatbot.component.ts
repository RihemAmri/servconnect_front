import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chatbot.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
   standalone: true,
   imports: [CommonModule, FormsModule],  
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {

  isLoggedIn = false;
  userName: string = '';
  newMessage: string = '';
  isAdmin = false;
  messages: { sender: 'bot' | 'user'; text: string }[] = [];

  constructor(private auth: AuthService, private chatService: ChatService) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();

    if (user) {
      this.isLoggedIn = true;
      this.userName = user.nom;   
       this.isAdmin = user.role === 'admin';  
      if (!this.isAdmin) {
        this.addMessage('bot', `Bonjour ${this.userName} 😊 comment puis-je vous aider ?`);
      }
    } else {
      this.addMessage('bot',"Bonjour 👋 Je suis votre assistant. Quel est votre nom ?");
    }
  }

  sendMessage() {
    const msg = this.newMessage.trim();
    if (!msg) return;

    this.addMessage('user', msg);

    // si non connecté → le 1er msg = nom utilisateur
    if (!this.isLoggedIn && !this.userName) {
      this.userName = msg;
      this.addMessage('bot', `Ravi de vous rencontrer ${msg} 😊 posez-moi vos questions !`);
      this.newMessage = '';
      return;
    }

    this.chatService.send(this.newMessage, this.userName).subscribe((res: any) => {
      console.log("ili tib3ath" ,this.newMessage);
      this.addMessage('bot', res.reply);
      console.log("lil rep : ",res.reply);
    });

    this.newMessage = '';
  }

  addMessage(sender:'bot'|'user', text:string) {
    
    this.messages.push({ sender, text });
  }
}
