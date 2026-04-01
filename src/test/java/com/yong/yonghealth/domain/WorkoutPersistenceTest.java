package com.yong.yonghealth.domain;

import com.yong.yonghealth.repository.ExerciseRepository;
import com.yong.yonghealth.repository.ExerciseSetRepository;
import com.yong.yonghealth.repository.WorkoutRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static com.yong.yonghealth.support.TestFixtures.exercise;
import static com.yong.yonghealth.support.TestFixtures.exerciseSet;
import static com.yong.yonghealth.support.TestFixtures.workout;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class WorkoutPersistenceTest {

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ExerciseSetRepository exerciseSetRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void save_populatesAuditingFields() {
        Workout workout = workout();

        Workout saved = workoutRepository.saveAndFlush(workout);

        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    void deleteWorkout_cascadesToExercisesAndSets() {
        Workout workout = workout();
        Exercise exercise = exercise(workout, "벤치프레스", 1);
        exerciseSet(exercise, 1);
        exerciseSet(exercise, 2);
        Workout saved = workoutRepository.saveAndFlush(workout);

        entityManager.clear();

        workoutRepository.deleteById(saved.getId());
        workoutRepository.flush();

        assertThat(workoutRepository.findById(saved.getId())).isEmpty();
        assertThat(exerciseRepository.count()).isZero();
        assertThat(exerciseSetRepository.count()).isZero();
    }
}
