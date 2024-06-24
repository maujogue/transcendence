import tensorflow as tf
from tensorflow.keras.layers import InputLayer

# Define a custom InputLayer if necessary
class CustomInputLayer(InputLayer):
    def __init__(self, batch_input_shape=None, dtype=None, sparse=False, name=None, **kwargs):
        super(CustomInputLayer, self).__init__(batch_input_shape=batch_input_shape, dtype=dtype, sparse=sparse, name=name, **kwargs)

# Load the .keras model with custom objects
model = None
try:
    model = tf.keras.models.load_model('AI_0.40avg.h5', custom_objects={'CustomInputLayer': CustomInputLayer})
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")

# Save it as a .h5 model if model is loaded successfully
if model:
    try:
        model.save('test_model.h5')
        print("Model saved successfully as test_model.h5")
    except Exception as e:
        print(f"Error saving model: {e}")
else:
    print("Model not loaded, cannot save.")