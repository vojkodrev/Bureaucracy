package main

import "context"

const purchasePredictorPredictionJobName = "purchase_predictor_prediction"

type PurchasePredictorPredictionJobHandler struct {
	runner *PurchasePredictorRunner
}

func NewPurchasePredictorPredictionJobHandler(runner *PurchasePredictorRunner) *PurchasePredictorPredictionJobHandler {
	return &PurchasePredictorPredictionJobHandler{runner: runner}
}

func (handler *PurchasePredictorPredictionJobHandler) Name() string {
	return purchasePredictorPredictionJobName
}

func (handler *PurchasePredictorPredictionJobHandler) Handle(ctx context.Context) error {
	return handler.runner.Run(ctx, "predict")
}
