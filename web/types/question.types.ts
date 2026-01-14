export enum QuestionStatus {
  PENDING = "PENDING",
  ANSWERED = "ANSWERED",
  CLOSED = "CLOSED",
}

export type Question = {
  id: string;
  knowledgeSeekerId: string;
  questionTitle: string;
  questionDescription: string;
  questionCategory: string;
  questionTags: string[];
  questionStatus: QuestionStatus;
  createdAt: Date;
  updatedAt: Date;
};

