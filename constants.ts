

import { Badge } from './types';
import { ShieldCheckIcon, SparklesIcon, TrophyIcon, AcademicCapIcon } from './components/icons';

// Static definitions for badges that can be awarded to users.
// This data does not need to be in the database.
export const BADGE_DEFINITIONS: { [key: string]: Badge } = {
    'first-course': {
        id: 'first-course',
        name: 'First Step',
        description: 'Completed your first course.',
        icon: AcademicCapIcon,
        points: 25,
    },
    'prolific-learner': {
        id: 'prolific-learner',
        name: 'Prolific Learner',
        description: 'Completed 3 courses.',
        icon: TrophyIcon,
        points: 75,
    },
    'quiz-master': {
        id: 'quiz-master',
        name: 'Quiz Master',
        description: 'Achieved a perfect score (100%) on a quiz.',
        icon: SparklesIcon,
        points: 50,
    },
    'completionist': {
        id: 'completionist',
        name: 'Completionist',
        description: 'Completed all available courses.',
        icon: ShieldCheckIcon,
        points: 150,
    },
};
