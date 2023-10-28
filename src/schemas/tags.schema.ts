import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Tag {
  @Prop()
  name: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

TagSchema.pre('deleteOne', async function (next) {
  const tagId = this.getQuery()['_id'];
  const allPosts = await mongoose.model('Post').find();
  const posts = allPosts.filter(post => post.tags.include(tagId))
  posts.map(async (post) => {
    post.tags.pull(tagId)
    await post.save()
  })
});
