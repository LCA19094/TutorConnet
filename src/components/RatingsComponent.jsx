import React, { useState, useEffect } from 'react';
import { ratingsAPI } from '../services/api';
import { Star, Heart, ThumbsUp, Loader } from 'lucide-react';

export default function RatingsComponent({ tutorId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('recent');
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [tutorId, page, sortBy]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await ratingsAPI.getTutorReviews(tutorId, page, sortBy);
      setReviews(response.data.reviews || []);
    } catch (err) {
      setError('Error al cargar reseñas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ratingsAPI.getTutorStats(tutorId);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Assuming we have a sessionId from context or props
      await ratingsAPI.create({
        tutorId,
        rating,
        reviewText: review,
        communicationRating: rating,
        knowledgeRating: rating,
        punctualityRating: rating,
        teachingStyleRating: rating
      });
      setReview('');
      setRating(5);
      setShowForm(false);
      fetchReviews();
      fetchStats();
    } catch (err) {
      setError('Error al enviar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (ratingId) => {
    try {
      await ratingsAPI.markHelpful(ratingId);
      fetchReviews();
    } catch (err) {
      console.error('Error marking helpful:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Summary */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {stats.averageRating?.toFixed(1)}
              </div>
              <div className="flex justify-center mt-2 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(stats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm mt-2">{stats.totalRatings} reseñas</p>
            </div>

            {/* Rating Distribution */}
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{stars}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${
                        stats.distribution?.[`rating_${stars}`]
                          ? (stats.distribution[`rating_${stars}`] / stats.totalRatings) * 100
                          : 0
                      }%`
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">
                  {stats.distribution?.[`rating_${stars}`] || 0}
                </span>
              </div>
            ))}
          </div>

          {/* Category Ratings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Comunicación', key: 'communicationAvg' },
              { label: 'Conocimiento', key: 'knowledgeAvg' },
              { label: 'Puntualidad', key: 'punctualityAvg' },
              { label: 'Metodología', key: 'teachingStyleAvg' }
            ].map((cat) => (
              <div key={cat.key} className="text-center">
                <p className="text-sm font-medium text-gray-700">{cat.label}</p>
                <div className="flex justify-center mt-2 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.round(stats[cat.key] || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm font-bold text-gray-800 mt-1">
                  {stats[cat.key]?.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Review Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
      >
        {showForm ? 'Cancelar' : 'Escribir Reseña'}
      </button>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmitRating} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación General
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${
                      r <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu Reseña
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Comparte tu experiencia con este tutor..."
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-medium hover:shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Reseña'
            )}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {review.student?.user?.firstName} {review.student?.user?.lastName}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{review.reviewText}</p>

              <button
                onClick={() => handleMarkHelpful(review.id)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition"
              >
                <ThumbsUp className="w-4 h-4" />
                Útil ({review.helpfulCount || 0})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
