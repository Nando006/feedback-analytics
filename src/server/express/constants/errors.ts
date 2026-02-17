export const API_ERROR_INVALID_INTENT = 'invalid_intent' as const;
export const API_ERROR_INVALID_PAYLOAD = 'invalid_payload' as const;
export const API_ERROR_ENTERPRISE_NOT_FOUND = 'enterprise_not_found' as const;
export const API_ERROR_UPDATE_FAILED = 'update_failed' as const;
export const API_ERROR_VERIFY_FAILED = 'verify_failed' as const;
export const API_ERROR_UPSERT_FAILED = 'upsert_failed' as const;
export const API_ERROR_INVALID_CREDENTIALS = 'invalid_credentials' as const;
export const API_ERROR_INTERNAL_ERROR = 'internal_error' as const;
export const API_ERROR_INTERNAL_SERVER_ERROR = 'internal_server_error' as const;

export const API_ERROR_ENTERPRISE_ID_REQUIRED = 'enterprise_id_required' as const;
export const API_ERROR_COLLECTING_DATA_NOT_FOUND = 'collecting_data_not_found' as const;
export const API_ERROR_EMPTY_PAYLOAD = 'empty_payload' as const;

export const API_ERROR_COLLECTION_POINT_ERROR = 'collection_point_error' as const;
export const API_ERROR_COLLECTION_POINT_NOT_FOUND = 'collection_point_not_found' as const;
export const API_ERROR_UNABLE_TO_ACTIVATE_QR = 'unable_to_activate_qr' as const;
export const API_ERROR_UNABLE_TO_CREATE_QR_CP = 'unable_to_create_qr_cp' as const;
export const API_ERROR_UNABLE_TO_DISABLE_QR = 'unable_to_disable_qr' as const;

export const API_ERROR_DEVICE_CHECK_FAILED = 'device_check_failed' as const;
export const API_ERROR_DEVICE_BLOCKED = 'DEVICE_BLOCKED' as const;
export const API_ERROR_DEVICE_ALREADY_SUBMITTED = 'DEVICE_ALREADY_SUBMITTED' as const;
export const API_ERROR_DEVICE_CREATION_FAILED = 'device_creation_failed' as const;
export const API_ERROR_FEEDBACK_INSERT_FAILED = 'feedback_insert_failed' as const;

export const API_ERROR_FAILED_TO_COUNT_FEEDBACKS = 'failed_to_count_feedbacks' as const;
export const API_ERROR_FAILED_TO_FETCH_FEEDBACKS = 'failed_to_fetch_feedbacks' as const;
export const API_ERROR_FAILED_TO_FETCH_STATS = 'failed_to_fetch_stats' as const;
export const API_ERROR_FAILED_TO_FETCH_FEEDBACK_INSIGHTS_REPORT =
	'failed_to_fetch_feedback_insights_report' as const;
export const API_ERROR_FAILED_TO_FETCH_FEEDBACK_ANALYSIS =
	'failed_to_fetch_feedback_analysis' as const;

export const API_ERROR_PHONE_TAKEN = 'phone_taken' as const;
export const API_ERROR_DOCUMENT_TAKEN = 'document_taken' as const;
export const API_ERROR_SIGNUP_FAILED = 'signup_failed' as const;
export const API_ERROR_EMAIL_TAKEN = 'email_taken' as const;
export const API_ERROR_DOCUMENT_REQUIRED = 'document_required' as const;
export const API_ERROR_DATABASE_ERROR = 'database_error' as const;

export type ApiRegisterErrorCode =
	| typeof API_ERROR_SIGNUP_FAILED
	| typeof API_ERROR_EMAIL_TAKEN
	| typeof API_ERROR_PHONE_TAKEN
	| typeof API_ERROR_DOCUMENT_TAKEN
	| typeof API_ERROR_DOCUMENT_REQUIRED
	| typeof API_ERROR_DATABASE_ERROR;
