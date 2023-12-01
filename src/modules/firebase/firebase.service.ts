import { Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidationErrorMessages } from 'src/common/constants';

@Injectable()
export class FirebaseService {
  private readonly admin: admin.app.App;

  constructor() {
    const adminConfig: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    this.admin = admin.initializeApp({
      credential: admin.credential.cert(adminConfig),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  // Add methods for interacting with Firebase services (Firestore, Authentication, etc.)
  createUser(user: CreateUserDto){
    const {displayName, createdAt, email, photoURL} = user;
    const firestore = this.admin.firestore();
    firestore.collection('users').add({
      displayName,
      createdAt,
      email,
      photoURL
    })
  }

  async updateUser(email: string, user: UpdateUserDto){
    const { displayName, photoURL } = user;
    const firestore = this.admin.firestore();
    const userSnapshot = await firestore.collection("users").where("email", '==', email).get()
    if (userSnapshot.empty) {
      throw new NotFoundException(ValidationErrorMessages.USER_NOT_FOUND);
    }
    const userDocument = userSnapshot.docs[0];
    await userDocument.ref.update({
      displayName,
      photoURL
    });
  }
}
