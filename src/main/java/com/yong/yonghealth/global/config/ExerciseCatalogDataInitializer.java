package com.yong.yonghealth.global.config;

import com.yong.yonghealth.domain.*;
import com.yong.yonghealth.repository.ExerciseCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ExerciseCatalogDataInitializer implements ApplicationRunner {

    private final ExerciseCatalogRepository exerciseCatalogRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (exerciseCatalogRepository.count() > 0) {
            return;
        }

        // 가슴
        save("벤치프레스", BodyPart.CHEST, Equipment.BARBELL, MovementType.PUSH,
                List.of("벤치", "bench press", "flat bench"));
        save("인클라인 벤치프레스", BodyPart.CHEST, Equipment.BARBELL, MovementType.PUSH,
                List.of("인클라인 벤치", "incline bench press"));
        save("디클라인 벤치프레스", BodyPart.CHEST, Equipment.BARBELL, MovementType.PUSH,
                List.of("디클라인 벤치", "decline bench press"));
        save("덤벨 벤치프레스", BodyPart.CHEST, Equipment.DUMBBELL, MovementType.PUSH,
                List.of("덤벨 벤치", "dumbbell bench press"));
        save("덤벨 인클라인 프레스", BodyPart.CHEST, Equipment.DUMBBELL, MovementType.PUSH,
                List.of("인클라인 덤벨", "dumbbell incline press"));
        save("덤벨 플라이", BodyPart.CHEST, Equipment.DUMBBELL, MovementType.PUSH,
                List.of("플라이", "dumbbell fly"));
        save("케이블 크로스오버", BodyPart.CHEST, Equipment.CABLE, MovementType.PUSH,
                List.of("크로스오버", "cable crossover"));
        save("체스트 프레스 머신", BodyPart.CHEST, Equipment.MACHINE, MovementType.PUSH,
                List.of("체스트프레스", "chest press machine"));
        save("펙덱 플라이", BodyPart.CHEST, Equipment.MACHINE, MovementType.PUSH,
                List.of("펙덱", "pec deck fly"));
        save("딥스", BodyPart.CHEST, Equipment.BODYWEIGHT, MovementType.PUSH,
                List.of("dips", "chest dips"));
        save("푸시업", BodyPart.CHEST, Equipment.BODYWEIGHT, MovementType.PUSH,
                List.of("푸쉬업", "push up", "pushup"));

        // 등
        save("데드리프트", BodyPart.BACK, Equipment.BARBELL, MovementType.PULL,
                List.of("deadlift", "컨벤셔널 데드리프트"));
        save("바벨 로우", BodyPart.BACK, Equipment.BARBELL, MovementType.PULL,
                List.of("벤트오버 로우", "barbell row", "bent over row"));
        save("펜들레이 로우", BodyPart.BACK, Equipment.BARBELL, MovementType.PULL,
                List.of("pendlay row"));
        save("덤벨 로우", BodyPart.BACK, Equipment.DUMBBELL, MovementType.PULL,
                List.of("원암 덤벨 로우", "dumbbell row"));
        save("풀업", BodyPart.BACK, Equipment.BODYWEIGHT, MovementType.PULL,
                List.of("턱걸이", "pull up", "pullup", "chin up"));
        save("랫풀다운", BodyPart.BACK, Equipment.CABLE, MovementType.PULL,
                List.of("랫 풀다운", "lat pulldown"));
        save("시티드 로우", BodyPart.BACK, Equipment.CABLE, MovementType.PULL,
                List.of("시티드 케이블 로우", "seated row", "cable row"));
        save("티바 로우", BodyPart.BACK, Equipment.MACHINE, MovementType.PULL,
                List.of("t-bar row", "t바 로우"));

        // 하체
        save("바벨 스쿼트", BodyPart.LEGS, Equipment.BARBELL, MovementType.LOWER,
                List.of("스쿼트", "squat", "back squat"));
        save("프론트 스쿼트", BodyPart.LEGS, Equipment.BARBELL, MovementType.LOWER,
                List.of("front squat"));
        save("레그 프레스", BodyPart.LEGS, Equipment.MACHINE, MovementType.LOWER,
                List.of("leg press"));
        save("레그 익스텐션", BodyPart.LEGS, Equipment.MACHINE, MovementType.LOWER,
                List.of("leg extension", "레그 컬"));
        save("레그 컬", BodyPart.LEGS, Equipment.MACHINE, MovementType.LOWER,
                List.of("leg curl", "햄스트링 컬"));
        save("루마니안 데드리프트", BodyPart.LEGS, Equipment.BARBELL, MovementType.LOWER,
                List.of("루마니안", "rdl", "romanian deadlift"));
        save("불가리안 스플릿 스쿼트", BodyPart.LEGS, Equipment.DUMBBELL, MovementType.LOWER,
                List.of("불가리안", "bulgarian split squat"));
        save("런지", BodyPart.LEGS, Equipment.DUMBBELL, MovementType.LOWER,
                List.of("덤벨 런지", "lunge", "walking lunge"));
        save("힙 스러스트", BodyPart.LEGS, Equipment.BARBELL, MovementType.LOWER,
                List.of("힙쓰러스트", "hip thrust"));
        save("카프 레이즈", BodyPart.LEGS, Equipment.MACHINE, MovementType.LOWER,
                List.of("카프레이즈", "calf raise", "종아리"));

        // 어깨
        save("오버헤드 프레스", BodyPart.SHOULDERS, Equipment.BARBELL, MovementType.PUSH,
                List.of("오버헤드", "overhead press", "밀리터리 프레스", "military press"));
        save("덤벨 숄더 프레스", BodyPart.SHOULDERS, Equipment.DUMBBELL, MovementType.PUSH,
                List.of("숄더 프레스", "dumbbell shoulder press"));
        save("사이드 레터럴 레이즈", BodyPart.SHOULDERS, Equipment.DUMBBELL, MovementType.PUSH,
                List.of("사이드 레이즈", "side lateral raise", "레터럴 레이즈"));
        save("프론트 레이즈", BodyPart.SHOULDERS, Equipment.DUMBBELL, MovementType.PUSH,
                List.of("front raise"));
        save("페이스 풀", BodyPart.SHOULDERS, Equipment.CABLE, MovementType.PULL,
                List.of("face pull"));
        save("리버스 펙덱 플라이", BodyPart.SHOULDERS, Equipment.MACHINE, MovementType.PULL,
                List.of("리어 델트 플라이", "reverse pec deck"));
        save("업라이트 로우", BodyPart.SHOULDERS, Equipment.BARBELL, MovementType.PULL,
                List.of("upright row"));

        // 팔
        save("바벨 컬", BodyPart.ARMS, Equipment.BARBELL, MovementType.PULL,
                List.of("barbell curl", "이두 컬"));
        save("덤벨 컬", BodyPart.ARMS, Equipment.DUMBBELL, MovementType.PULL,
                List.of("dumbbell curl", "이두 덤벨 컬"));
        save("해머 컬", BodyPart.ARMS, Equipment.DUMBBELL, MovementType.PULL,
                List.of("hammer curl"));
        save("프리쳐 컬", BodyPart.ARMS, Equipment.BARBELL, MovementType.PULL,
                List.of("preacher curl", "이지바 컬"));
        save("케이블 컬", BodyPart.ARMS, Equipment.CABLE, MovementType.PULL,
                List.of("cable curl"));
        save("트라이셉스 푸시다운", BodyPart.ARMS, Equipment.CABLE, MovementType.PUSH,
                List.of("푸시다운", "triceps pushdown", "삼두 푸시다운"));
        save("오버헤드 트라이셉스 익스텐션", BodyPart.ARMS, Equipment.DUMBBELL, MovementType.PUSH,
                List.of("삼두 익스텐션", "overhead triceps extension"));
        save("스컬크러셔", BodyPart.ARMS, Equipment.BARBELL, MovementType.PUSH,
                List.of("skull crusher", "라잉 트라이셉스 익스텐션"));
        save("클로즈그립 벤치프레스", BodyPart.ARMS, Equipment.BARBELL, MovementType.PUSH,
                List.of("close grip bench press", "내로우 벤치"));

        // 코어
        save("플랭크", BodyPart.CORE, Equipment.BODYWEIGHT, MovementType.CORE,
                List.of("plank"));
        save("크런치", BodyPart.CORE, Equipment.BODYWEIGHT, MovementType.CORE,
                List.of("crunch", "윗몸일으키기"));
        save("레그 레이즈", BodyPart.CORE, Equipment.BODYWEIGHT, MovementType.CORE,
                List.of("leg raise", "행잉 레그 레이즈"));
        save("러시안 트위스트", BodyPart.CORE, Equipment.BODYWEIGHT, MovementType.CORE,
                List.of("russian twist"));
        save("케이블 크런치", BodyPart.CORE, Equipment.CABLE, MovementType.CORE,
                List.of("cable crunch"));
        save("ab 롤아웃", BodyPart.CORE, Equipment.BODYWEIGHT, MovementType.CORE,
                List.of("ab rollout", "ab휠", "ab wheel"));

        // 유산소
        save("러닝", BodyPart.CARDIO, Equipment.MACHINE, MovementType.CARDIO,
                List.of("런닝", "running", "트레드밀", "treadmill"));
        save("사이클", BodyPart.CARDIO, Equipment.MACHINE, MovementType.CARDIO,
                List.of("자전거", "cycling", "바이크", "bike"));
        save("로잉 머신", BodyPart.CARDIO, Equipment.MACHINE, MovementType.CARDIO,
                List.of("rowing", "로잉", "rowing machine"));
        save("점프 로프", BodyPart.CARDIO, Equipment.BODYWEIGHT, MovementType.CARDIO,
                List.of("줄넘기", "jump rope"));
        save("스텝퍼", BodyPart.CARDIO, Equipment.MACHINE, MovementType.CARDIO,
                List.of("stepper", "스텝밀", "stairmaster"));
    }

    private void save(String name, BodyPart category, Equipment equipment, MovementType movementType, List<String> aliases) {
        ExerciseCatalog catalog = ExerciseCatalog.builder()
                .name(name)
                .category(category)
                .equipment(equipment)
                .movementType(movementType)
                .active(true)
                .build();

        for (String alias : aliases) {
            catalog.addAlias(ExerciseCatalogAlias.builder()
                    .exerciseCatalog(catalog)
                    .alias(alias)
                    .build());
        }

        exerciseCatalogRepository.save(catalog);
    }
}
