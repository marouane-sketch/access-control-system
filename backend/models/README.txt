Please download the following ONNX models and place them in this directory:

1. `face_detection_yunet_2023mar.onnx`
   - Source: https://github.com/opencv/opencv_zoo/tree/master/models/face_detection_yunet

2. `w600k_r50.onnx` (ArcFace ResNet50)
   - Source: https://github.com/deepinsight/insightface/tree/master/model_zoo
   - Or any component-compatible ArcFace ONNX model.

If these files are missing, the backend will run in STRICT MODE (returning None/Errors for biometrics).
