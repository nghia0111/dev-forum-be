import { Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { ValidationErrorMessages } from 'src/common/constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
    const {id, displayName, createdAt, email, photoURL} = user;
    const firestore = this.admin.firestore();
    firestore.collection('users').doc(id).set({displayName, createdAt, email, photoURL});
  }

  async updateUser(user: UpdateUserDto){
    const { id, displayName, photoURL } = user;
    const firestore = this.admin.firestore();
    const userDocument = await firestore.collection('users').doc(id).get();
    if (!userDocument) {
      throw new NotFoundException(ValidationErrorMessages.USER_NOT_FOUND);
    }
    userDocument.ref.update({displayName, photoURL});
  }
}
