import { relations } from "drizzle-orm/relations";
import { collectionPoints, feedback, enterprise, trackedDevices, feedbackAnalysis, customer, usersInAuth, catalogItems, questionsOfFeedbacks, feedbackQuestionAnswers, collectingDataEnterprise, feedbackInsightsReport, feedbackQuestionSubquestions, feedbackSubquestionAnswers } from "./schema";

export const feedbackRelations = relations(feedback, ({one, many}) => ({
	collectionPoint: one(collectionPoints, {
		fields: [feedback.collectionPointId],
		references: [collectionPoints.id]
	}),
	enterprise: one(enterprise, {
		fields: [feedback.enterpriseId],
		references: [enterprise.id]
	}),
	trackedDevice: one(trackedDevices, {
		fields: [feedback.trackedDeviceId],
		references: [trackedDevices.id]
	}),
	feedbackAnalyses: many(feedbackAnalysis),
	feedbackQuestionAnswers: many(feedbackQuestionAnswers),
	feedbackSubquestionAnswers: many(feedbackSubquestionAnswers),
}));

export const collectionPointsRelations = relations(collectionPoints, ({one, many}) => ({
	feedbacks: many(feedback),
	catalogItem: one(catalogItems, {
		fields: [collectionPoints.catalogItemId],
		references: [catalogItems.id]
	}),
	enterprise: one(enterprise, {
		fields: [collectionPoints.enterpriseId],
		references: [enterprise.id]
	}),
}));

export const enterpriseRelations = relations(enterprise, ({one, many}) => ({
	feedbacks: many(feedback),
	customers: many(customer),
	trackedDevices: many(trackedDevices),
	questionsOfFeedbacks: many(questionsOfFeedbacks),
	usersInAuth: one(usersInAuth, {
		fields: [enterprise.authUserId],
		references: [usersInAuth.id]
	}),
	collectingDataEnterprises: many(collectingDataEnterprise),
	collectionPoints: many(collectionPoints),
	feedbackInsightsReports: many(feedbackInsightsReport),
	catalogItems: many(catalogItems),
}));

export const trackedDevicesRelations = relations(trackedDevices, ({one, many}) => ({
	feedbacks: many(feedback),
	usersInAuth: one(usersInAuth, {
		fields: [trackedDevices.blockedBy],
		references: [usersInAuth.id]
	}),
	customer: one(customer, {
		fields: [trackedDevices.customerId],
		references: [customer.id]
	}),
	enterprise: one(enterprise, {
		fields: [trackedDevices.enterpriseId],
		references: [enterprise.id]
	}),
}));

export const feedbackAnalysisRelations = relations(feedbackAnalysis, ({one}) => ({
	feedback: one(feedback, {
		fields: [feedbackAnalysis.feedbackId],
		references: [feedback.id]
	}),
}));

export const customerRelations = relations(customer, ({one, many}) => ({
	enterprise: one(enterprise, {
		fields: [customer.enterpriseId],
		references: [enterprise.id]
	}),
	trackedDevices: many(trackedDevices),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	trackedDevices: many(trackedDevices),
	enterprises: many(enterprise),
}));

export const questionsOfFeedbacksRelations = relations(questionsOfFeedbacks, ({one, many}) => ({
	catalogItem: one(catalogItems, {
		fields: [questionsOfFeedbacks.catalogItemId],
		references: [catalogItems.id]
	}),
	enterprise: one(enterprise, {
		fields: [questionsOfFeedbacks.enterpriseId],
		references: [enterprise.id]
	}),
	feedbackQuestionAnswers: many(feedbackQuestionAnswers),
	feedbackQuestionSubquestions: many(feedbackQuestionSubquestions),
}));

export const catalogItemsRelations = relations(catalogItems, ({one, many}) => ({
	questionsOfFeedbacks: many(questionsOfFeedbacks),
	collectionPoints: many(collectionPoints),
	feedbackInsightsReports: many(feedbackInsightsReport),
	enterprise: one(enterprise, {
		fields: [catalogItems.enterpriseId],
		references: [enterprise.id]
	}),
}));

export const feedbackQuestionAnswersRelations = relations(feedbackQuestionAnswers, ({one}) => ({
	feedback: one(feedback, {
		fields: [feedbackQuestionAnswers.feedbackId],
		references: [feedback.id]
	}),
	questionsOfFeedback: one(questionsOfFeedbacks, {
		fields: [feedbackQuestionAnswers.questionId],
		references: [questionsOfFeedbacks.id]
	}),
}));

export const collectingDataEnterpriseRelations = relations(collectingDataEnterprise, ({one}) => ({
	enterprise: one(enterprise, {
		fields: [collectingDataEnterprise.enterpriseId],
		references: [enterprise.id]
	}),
}));

export const feedbackInsightsReportRelations = relations(feedbackInsightsReport, ({one}) => ({
	catalogItem: one(catalogItems, {
		fields: [feedbackInsightsReport.catalogItemId],
		references: [catalogItems.id]
	}),
	enterprise: one(enterprise, {
		fields: [feedbackInsightsReport.enterpriseId],
		references: [enterprise.id]
	}),
}));

export const feedbackQuestionSubquestionsRelations = relations(feedbackQuestionSubquestions, ({one, many}) => ({
	questionsOfFeedback: one(questionsOfFeedbacks, {
		fields: [feedbackQuestionSubquestions.questionId],
		references: [questionsOfFeedbacks.id]
	}),
	feedbackSubquestionAnswers: many(feedbackSubquestionAnswers),
}));

export const feedbackSubquestionAnswersRelations = relations(feedbackSubquestionAnswers, ({one}) => ({
	feedback: one(feedback, {
		fields: [feedbackSubquestionAnswers.feedbackId],
		references: [feedback.id]
	}),
	feedbackQuestionSubquestion: one(feedbackQuestionSubquestions, {
		fields: [feedbackSubquestionAnswers.subquestionId],
		references: [feedbackQuestionSubquestions.id]
	}),
}));