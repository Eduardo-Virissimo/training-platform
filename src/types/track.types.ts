import { QuizTrack } from './quizTrack.types';
import { Training } from './training.types';
import { UserTracks } from './userTracks.types';

export interface Track {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  userTracks: UserTracks[];
  trainings: Training[];
  quizTracks: QuizTrack[];
}
