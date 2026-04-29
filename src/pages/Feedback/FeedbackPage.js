// // src/pages/Feedback/FeedbackPage.jsx
// import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { createFeedback } from "../../services/features/retailer/feedbackSlice";
// import { selectAuthState } from "../../store/selectors/authSelector";
// import "./FeedbackPage.css"; // see CSS below

// const FeedbackPage = () => {
//   const [message, setMessage] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const dispatch = useDispatch();
//   const { user } = useSelector(selectAuthState);

//   // Fallback values if user object doesn't contain phone
//   const userName = user?.name || "Anonymous User";
//   const userPhone = user?.phone || user?.mobile || "N/A";

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!message.trim()) {
//       alert("Please enter your feedback.");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       // dispatch the thunk and unwrap to get the fulfilled action or catch errors
//       await dispatch(
//         createFeedback({
//           message: message.trim(),
//           user: userName,
//           phone: userPhone,
//         })
//       ).unwrap();

//       setMessage("");
//       alert("Feedback submitted successfully!");
//     } catch (err) {
//       alert("Submission failed: " + (err || "Please try again later."));
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="feedback-page">
//       <div className="feedback-card">
//         <h2 className="feedback-title">Your Feedback</h2>
//         <p className="feedback-subtitle">
//           We value your opinion. Let us know how we’re doing.
//         </p>
//         <form onSubmit={handleSubmit}>
//           <textarea
//             className="feedback-textarea"
//             placeholder="Write your feedback here..."
//             rows={6}
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             maxLength={1000}
//           />
//           <div className="feedback-char-count">
//             {message.length}/1000
//           </div>
//           <button
//             type="submit"
//             className="feedback-submit-btn"
//             disabled={submitting}
//           >
//             {submitting ? "Submitting..." : "Submit Feedback"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default FeedbackPage;

//------------------------------

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createFeedback } from "../../services/features/retailer/feedbackSlice";
import { selectAuthState } from "../../store/selectors/authSelector";
import { Button, toast } from "../../components/ui/UI";
import "./FeedbackPage.css";

const FeedbackPage = () => {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuthState);

  const userName = user?.name || "Anonymous User";
  const userPhone = user?.phone || user?.mobile || "N/A";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Please enter your feedback.");
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        createFeedback({
          message: message.trim(),
          user: userName,
          phone: userPhone,
        })
      ).unwrap();

      setMessage("");
      toast.success("Feedback submitted successfully!");
    } catch (err) {
      toast.error(err?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-card">
        <h2 className="feedback-title">Your Feedback</h2>
        <p className="feedback-subtitle">
          We value your opinion. Let us know how we’re doing.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            className="feedback-textarea"
            placeholder="Write your feedback here..."
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
          />

          <div className="feedback-char-count">
            {message.length}/1000
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;