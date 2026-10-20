package main

import "context"

const purchasePredictorTrainingJobName = "purchase_predictor_training"

type PurchasePredictorTrainingJobHandler struct {
	runner *PurchasePredictorRunner
}

func NewPurchasePredictorTrainingJobHandler(runner *PurchasePredictorRunner) *PurchasePredictorTrainingJobHandler {
	return &PurchasePredictorTrainingJobHandler{runner: runner}
}

func (handler *PurchasePredictorTrainingJobHandler) Name() string {
	return purchasePredictorTrainingJobName
}

func (handler *PurchasePredictorTrainingJobHandler) Handle(ctx context.Context) error {
	return handler.runner.Run(ctx, "train")
}
