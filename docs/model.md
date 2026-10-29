# Deep Neural Network (DNN) Model Specification

## 1. Mathematical Architecture
The classification engine employs a multi-layer feed-forward Deep Neural Network:

- **Input Dimension:** 8 features ($\mathbf{x} \in \mathbb{R}^8$)
- **Layer 1 (Dense):** 128 units, Rectified Linear Unit ($\text{ReLU}$) activation, He Uniform weight initialization
- **Dropout 1:** Rate $p = 0.30$ (deactivated during test evaluation and inference)
- **Layer 2 (Dense):** 64 units, $\text{ReLU}$ activation
- **Dropout 2:** Rate $p = 0.20$
- **Layer 3 (Dense):** 32 units, $\text{ReLU}$ activation
- **Output Layer (Dense):** 6 units, $\text{Softmax}$ activation

### Mathematical Formulation
$$\mathbf{z}^{[1]} = \mathbf{W}^{[1]} \mathbf{x} + \mathbf{b}^{[1]}, \quad \mathbf{a}^{[1]} = \max(0, \mathbf{z}^{[1]})$$
$$\mathbf{z}^{[2]} = \mathbf{W}^{[2]} \mathbf{a}^{[1]} + \mathbf{b}^{[2]}, \quad \mathbf{a}^{[2]} = \max(0, \mathbf{z}^{[2]})$$
$$\mathbf{z}^{[3]} = \mathbf{W}^{[3]} \mathbf{a}^{[2]} + \mathbf{b}^{[3]}, \quad \mathbf{a}^{[3]} = \max(0, \mathbf{z}^{[3]})$$
$$\mathbf{z}^{[4]} = \mathbf{W}^{[4]} \mathbf{a}^{[3]} + \mathbf{b}^{[4]}$$
$$\hat{y}_k = \frac{e^{z_k^{[4]}}}{\sum_{j=1}^6 e^{z_j^{[4]}}}, \quad \forall k \in \{1, \dots, 6\}$$

---

## 2. Optimization & Loss Function
- **Objective:** Minimization of Categorical Cross-Entropy Loss:
  $$\mathcal{L}(\mathbf{y}, \hat{\mathbf{y}}) = - \sum_{k=1}^6 y_k \log(\hat{y}_k + \epsilon)$$
- **Optimizer:** Adam (Adaptive Moment Estimation)
  - Learning rate $\alpha = 0.0025$
  - Exponential decay rates $\beta_1 = 0.9$, $\beta_2 = 0.999$
  - Numerical stability constant $\epsilon = 10^{-8}$
- **Early Stopping:** Monitored on validation loss with patience $\tau = 8$ epochs to avert overfitting.

---

## 3. Evaluation Metrics on Independent Test Split
- **Overall Accuracy:** Percentage of correctly classified instances across the held-out test distribution.
- **Confusion Matrix:** $6 \times 6$ contingency matrix detailing class confusions.
- **Precision:** $\frac{TP}{TP + FP}$ per category.
- **Recall:** $\frac{TP}{TP + FN}$ per category.
- **F1-Score:** Harmonic mean $2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$.
- **Macro Average F1:** Arithmetic mean of F1-scores across all 6 classes.
- **Weighted Average F1:** Support-weighted aggregate score.
