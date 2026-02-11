import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Users,
    Copy,
    Check,
    ShieldCheck,
    BookOpen,
    Loader2,
    ExternalLink,
    Settings,
} from 'lucide-react';
import { createClass, getMyClasses } from '../services/classService';
import { supabase } from '../supabaseClient';

export default function TeacherDashboard() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        loadClasses();
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(data);
        }
    };

    const loadClasses = async () => {
        try {
            const data = await getMyClasses();
            setClasses(data);
        } catch (error) {
            console.error('Error loading classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async (classData) => {
        try {
            await createClass(classData);
            await loadClasses();
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating class:', error);
        }
    };

    const copyInviteCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getMemberCount = (classItem) => {
        if (classItem.members && Array.isArray(classItem.members)) {
            return classItem.members.length;
        }
        if (classItem.members && typeof classItem.members === 'object') {
            return classItem.members.count || 0;
        }
        return 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-amber-50/30">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
                                Teaching Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Manage your classes and engage with students
                            </p>
                        </div>
                        {profile?.verification_status === 'pending' && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 border-2 border-amber-200 rounded-xl"
                            >
                                <ShieldCheck className="w-5 h-5 text-amber-600" />
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-amber-900">
                                        Verification Pending
                                    </p>
                                    <p className="text-xs text-amber-700">24-48 hours</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Stats Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Classes</p>
                                <p className="text-3xl font-serif font-bold text-gray-900">
                                    {classes.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Students</p>
                                <p className="text-3xl font-serif font-bold text-gray-900">
                                    {classes.reduce((sum, c) => sum + getMemberCount(c), 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl p-6 shadow-lg transition-all flex items-center justify-center gap-3"
                    >
                        <Plus className="w-6 h-6" />
                        <span className="font-semibold text-lg">Create New Class</span>
                    </motion.button>
                </motion.div>

                {/* Classes Grid */}
                {classes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-12 text-center shadow-xl border-2 border-gray-100"
                    >
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                            No Classes Yet
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Create your first class to start sharing materials and engaging with students
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Class
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((classItem, index) => (
                            <motion.div
                                key={classItem.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ y: -4 }}
                                className="group relative bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all overflow-hidden"
                            >
                                {/* Geometric corner accent */}
                                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                                    <svg viewBox="0 0 80 80" className="w-full h-full">
                                        <path d="M 0 0 L 80 0 L 0 80 Z" fill="#9333EA" />
                                    </svg>
                                </div>

                                <div className="relative z-10 p-6">
                                    {/* Class Header */}
                                    <div className="mb-4">
                                        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                                            {classItem.name}
                                        </h3>
                                        {classItem.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {classItem.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Student Count */}
                                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                                        <Users className="w-4 h-4" />
                                        <span className="font-medium">
                                            {getMemberCount(classItem)} student
                                            {getMemberCount(classItem) !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Invite Code */}
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 mb-2 font-medium">
                                            Invite Code
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg font-mono text-lg font-bold text-purple-700 tracking-wider">
                                                {classItem.invite_code}
                                            </code>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => copyInviteCode(classItem.invite_code)}
                                                className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                                                title="Copy invite code"
                                            >
                                                {copiedCode === classItem.invite_code ? (
                                                    <Check className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <Copy className="w-5 h-5 text-purple-600" />
                                                )}
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                                        <button className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                                            <ExternalLink className="w-4 h-4" />
                                            View Class
                                        </button>
                                        <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                            <Settings className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Class Modal */}
            <CreateClassModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateClass}
            />
        </div>
    );
}

// Create Class Modal Component
function CreateClassModal({ isOpen, onClose, onCreate }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onCreate({ name, description });
            setName('');
            setDescription('');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                        >
                            {/* Geometric corner accents */}
                            <div className="absolute top-0 left-0 w-16 h-16 opacity-10">
                                <svg viewBox="0 0 64 64" className="w-full h-full">
                                    <path d="M 0 0 L 64 0 L 0 64 Z" fill="#9333EA" />
                                </svg>
                            </div>
                            <div className="absolute bottom-0 right-0 w-16 h-16 opacity-10 rotate-180">
                                <svg viewBox="0 0 64 64" className="w-full h-full">
                                    <path d="M 0 0 L 64 0 L 0 64 Z" fill="#9333EA" />
                                </svg>
                            </div>

                            <div className="relative z-10 p-8">
                                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">
                                    Create New Class
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Class Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g., Biology 101 - Spring 2024"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Brief description of the class..."
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 py-3 px-4 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || !name.trim()}
                                            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-5 h-5" />
                                                    Create Class
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
